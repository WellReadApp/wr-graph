import db from '../../libs/db';
import { ItemNotFoundError } from '@src/graph/errors';
import { Book } from './types/Book';
import { BookGenre } from './types/BookGenre';
import { Quote } from './types/Quote';
import { KeyPoint } from './types/KeyPoint';
import { Genre } from './types/Genre';

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
        title ILIKE $1 
        OR primary_author_name ILIKE $1
        OR description ILIKE $1
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
      WHERE status = 'ACTIVE'
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
      WHERE status = 'ACTIVE'
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
      AND status = 'ACTIVE'
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
        status = 'ACTIVE'
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

}