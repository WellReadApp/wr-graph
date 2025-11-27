import db from '../../libs/db';
import { ItemNotFoundError } from '@src/graph/errors';
import { Book } from './types/Book';
import { BookGenre } from './types/BookGenre';
import { Quote } from './types/Quote';
import { KeyPoint } from './types/KeyPoint';
import { Genre } from './types/Genre';
import { SummaryPage } from './types/SummaryPage';
import { EnjoymentCriteria } from './types/EnjoymentCriteria';
import { ActionableBenefit } from './types/ActionableBenefit';
import { ContrastingViewpoint } from './types/ContrastingViewpoint';
import { ActionableStep } from './types/ActionableStep';
import { BookTheme } from './types/BookTheme';

export class BookService {

  static async getBook(id: string): Promise<Book> {
    const book = await db.queryOne(`
      SELECT * FROM book.book WHERE id = $1
    `, [id]);

    if (!book) {
      throw new ItemNotFoundError('Book not found');
    }

    return book;
  }

  static async searchBooks(
    query: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Book[]> {
    return await db.query(`
      SELECT * FROM book.book
      WHERE 
        (title ILIKE $1 
        OR primary_author_name ILIKE $1
        OR description ILIKE $1)
        AND status = 'ENRICHED'
      ORDER BY readinglog_count DESC
      LIMIT $2 OFFSET $3
    `, [`%${query}%`, limit, offset]);
  }

  static async listPopularBooks(
    limit: number = 20,
    offset: number = 0
  ): Promise<Book[]> {
    return await db.query(`
      SELECT * FROM book.book
      WHERE status = 'ENRICHED'
      ORDER BY readinglog_count DESC, first_publish_year DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
  }

  static async listRecentBooks(
    limit: number = 20,
    offset: number = 0
  ): Promise<Book[]> {
    return await db.query(`
      SELECT * FROM book.book
      WHERE status = 'ENRICHED'
      AND created_at >= NOW() - INTERVAL '30 days'
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]); // added in last 30 days
  }

  static async incrementReadingLogCount(bookId: string): Promise<void> {
    await db.query(`
      UPDATE book.book
      SET readinglog_count = readinglog_count + 1
      WHERE id = $1
    `, [bookId]);
  }

  static async getBookGenres(bookId: string): Promise<BookGenre[]> {
    return await db.query(`
      SELECT * FROM book.book_genre 
      WHERE book_id = $1
      ORDER BY created_at ASC
    `, [bookId]);
  }

  static async getBookQuotes(bookId: string): Promise<Quote[]> {
    return await db.query(`
      SELECT * FROM book.quote 
      WHERE book_id = $1 
      ORDER BY order_index ASC NULLS LAST, created_at ASC
    `, [bookId]);
  }

  static async getBookKeyPoints(bookId: string): Promise<KeyPoint[]> {
    return await db.query(`
      SELECT * FROM book.key_point 
      WHERE book_id = $1 
      ORDER BY order_index ASC
    `, [bookId]);
  }

  static async getSimilarBooks(bookId: string, limit: number = 5): Promise<Book[]> {
    const similarBookIds = await db.query(`
      SELECT similar_book_id FROM book.similar_book
      WHERE book_id = $1
      ORDER BY similarity_score DESC
      LIMIT $2
    `, [bookId, limit]);

    if (!similarBookIds.length) return [];

    return await db.query(`
      SELECT * FROM book.book 
      WHERE id = ANY($1)
      AND status = 'ENRICHED'
    `, [similarBookIds.map(b => b.similar_book_id)]);
  }

  static async getGenre(genreId: string): Promise<Genre | null> {
    return await db.queryOne(`
      SELECT * FROM book.genre WHERE id = $1
    `, [genreId]);
  }

  static async listGenres(): Promise<Genre[]> {
    return await db.query(`
      SELECT DISTINCT g.* 
      FROM book.genre g
      INNER JOIN book.book_genre bg ON g.id = bg.genre_id
      ORDER BY g.name ASC
    `, []);
  }

  static async searchAutocomplete(
    query: string,
    limit: number = 5
  ): Promise<Book[]> {
    return await db.query(`
      SELECT *
      FROM book.book
      WHERE 
        status = 'ENRICHED'
        AND (
          title ILIKE $1 
          OR primary_author_name ILIKE $1
        )
      ORDER BY 
        CASE 
          WHEN title ILIKE $2 THEN 0  -- Exact match
          WHEN title ILIKE $3 THEN 1  -- Starts with
          ELSE 2                      -- Contains
        END,
        readinglog_count DESC
      LIMIT $4
    `, [
      `%${query}%`,      // Contains
      query,             // Exact match
      `${query}%`,       // Starts with
      limit
    ]);
  }

  static async getBookSummaryPages(bookId: string): Promise<SummaryPage[]> {
    return await db.query(`
      SELECT * FROM book.summary_page 
      WHERE book_id = $1 
      ORDER BY page_number ASC
    `, [bookId]);
  }

  static async getSummaryPageById(id: string): Promise<SummaryPage> {
    const page = await db.queryOne(`
      SELECT * FROM book.summary_page WHERE id = $1
    `, [id]);

    if (!page) {
      throw new ItemNotFoundError('Summary page not found');
    }

    return page;
  }

  static async getBookSummaryPage(bookId: string, pageNumber: number): Promise<SummaryPage> {
    const page = await db.queryOne(`
      SELECT * FROM book.summary_page 
      WHERE book_id = $1 AND page_number = $2
    `, [bookId, pageNumber]);

    if (!page) {
      throw new ItemNotFoundError('Summary page not found');
    }

    return page;
  }

  static async getBookEnjoymentCriteria(bookId: string): Promise<EnjoymentCriteria[]> {
    return await db.query(`
      SELECT * FROM book.enjoyment_criteria 
      WHERE book_id = $1 
      ORDER BY order_index ASC
    `, [bookId]);
  }

  static async getBookActionableBenefits(bookId: string): Promise<ActionableBenefit[]> {
    return await db.query(`
      SELECT * FROM book.actionable_benefit 
      WHERE book_id = $1 
      ORDER BY order_index ASC
    `, [bookId]);
  }

  static async getBookContrastingViewpoints(bookId: string): Promise<ContrastingViewpoint[]> {
    return await db.query(`
      SELECT * FROM book.contrasting_viewpoint 
      WHERE book_id = $1 
      ORDER BY order_index ASC
    `, [bookId]);
  }

  static async getBookActionableSteps(bookId: string): Promise<ActionableStep[]> {
    return await db.query(`
      SELECT * FROM book.actionable_step 
      WHERE book_id = $1 
      ORDER BY order_index ASC
    `, [bookId]);
  }

  static async getBookThemes(bookId: string): Promise<BookTheme[]> {
    return await db.query(`
      SELECT * FROM book.book_theme 
      WHERE book_id = $1
    `, [bookId]);
  }

}