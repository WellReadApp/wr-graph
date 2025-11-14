import db from '@src/libs/db';
import { ItemNotFoundError, BadRequestError } from '@src/graph/errors';
import { LibraryStats } from './types/LibraryStats';
import { Library } from './types/Library';
import { ReadingProgress } from './types/ReadingProgress';
import { ReadingStats } from './types/ReadingStats';

export class LibraryService {

  static async getUserLibrary(userId: string): Promise<Library[]> {
    return await db.query(`
      SELECT * FROM "user".library 
      WHERE user_id = $1
      ORDER BY added_at DESC
    `, [userId]);
  }

  static async getLastReadingBook(userId: string): Promise<Library | null> {
    return await db.queryOne(`
      SELECT l.* 
      FROM "user".library l
      JOIN "user".reading_progress rp 
        ON l.user_id = rp.user_id 
        AND l.book_id = rp.book_id
      WHERE l.user_id = $1 
        AND l.status = 'reading'
        AND rp.status = 'reading'
        AND rp.progress > 0 
        AND rp.progress < 100
      ORDER BY rp.last_read_at DESC
      LIMIT 1
    `, [userId]);
  }

  static async getLibraryByStatus(
    userId: string, 
    status: 'reading' | 'completed' | 'want-to-read'
  ): Promise<Library[]> {
    return await db.query(`
      SELECT * FROM "user".library
      WHERE user_id = $1 AND status = $2
      ORDER BY added_at DESC
    `, [userId, status]);
  }

  static async addToLibrary(
    userId: string,
    bookId: string,
    status: 'reading' | 'completed' | 'want-to-read' = 'want-to-read'
  ): Promise<Library> {
    return await db.queryOne(`
      INSERT INTO "user".library (user_id, book_id, status)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [userId, bookId, status]);
  }

  static async updateStatus(
    userId: string,
    bookId: string,
    status: 'reading' | 'completed' | 'want-to-read'
  ): Promise<Library> {
    const updated = await db.queryOne(`
      UPDATE "user".library
      SET status = $3, updated_at = NOW()
      WHERE user_id = $1 AND book_id = $2
      RETURNING *
    `, [userId, bookId, status]);

    if (!updated) {
      throw new ItemNotFoundError('Book not found in library');
    }

    return updated;
  }

  static async removeFromLibrary(userId: string, bookId: string): Promise<boolean> {
    const result = await db.query(`
      DELETE FROM "user".library
      WHERE user_id = $1 AND book_id = $2
    `, [userId, bookId]);

    return result.rowCount > 0;
  }

  static async getLibraryStats(userId: string): Promise<LibraryStats> {
    const stats = await db.queryOne(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'reading') as reading,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'want-to-read') as want_to_read
      FROM "user".library
      WHERE user_id = $1
    `, [userId]);

    return {
      totalBooks: parseInt(stats.total),
      reading: parseInt(stats.reading),
      completed: parseInt(stats.completed),
      wantToRead: parseInt(stats.want_to_read)
    };
  }

  static async getLibraryEntry(
    userId: string, 
    bookId: string
  ): Promise<Library | null> {
    return await db.queryOne(`
      SELECT * FROM "user".library
      WHERE user_id = $1 AND book_id = $2
    `, [userId, bookId]);
  }

  static async getProgress(
    userId: string, 
    bookId: string
  ): Promise<ReadingProgress | null> {
    return await db.queryOne(`
      SELECT 
        progress,
        current_page,
        time_spent,
        status,
        started_at,
        completed_at,
        last_read_at
      FROM "user".reading_progress
      WHERE user_id = $1 AND book_id = $2
    `, [userId, bookId]);
  }

  static async updateProgress(
    userId: string,
    bookId: string,
    progress: number,
    currentPage?: number
  ): Promise<ReadingProgress> {
    if (progress < 0 || progress > 100) {
      throw new BadRequestError('Progress must be between 0 and 100');
    }

    return await db.queryOne(`
      INSERT INTO "user".reading_progress ( 
        user_id, book_id, progress, current_page, status, started_at, last_read_at
      )
      VALUES ($1, $2, $3, $4, 'reading', NOW(), NOW() )
      ON CONFLICT (user_id, book_id) 
      DO UPDATE SET
        progress = $3,
        current_page = COALESCE($4, reading_progress.current_page),
        last_read_at = NOW()
      RETURNING *
    `, [userId, bookId, progress, currentPage]);
  }

  static async updateTimeSpent(
    userId: string,
    bookId: string,
    additionalMinutes: number
  ): Promise<ReadingProgress> {
    if (additionalMinutes <= 0) {
      throw new BadRequestError('Time spent must be positive');
    }

    return await db.queryOne(`
      INSERT INTO "user".reading_progress (
        user_id, 
        book_id, 
        time_spent,
        last_read_at
      )
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (user_id, book_id) 
      DO UPDATE SET
        time_spent = COALESCE(reading_progress.time_spent, 0) + $3,
        last_read_at = NOW()
      RETURNING *
    `, [userId, bookId, additionalMinutes]);
  }

  static async markAsCompleted(
    userId: string,
    bookId: string
  ): Promise<ReadingProgress> {
    return await db.queryOne(`
      UPDATE "user".reading_progress
      SET 
        status = 'completed',
        progress = 100,
        completed_at = NOW(),
        last_read_at = NOW()
      WHERE user_id = $1 AND book_id = $2
      RETURNING *
    `, [userId, bookId]);
  }

  static async resetProgress(
    userId: string,
    bookId: string
  ): Promise<boolean> {
    const result = await db.query(`
      DELETE FROM "user".reading_progress
      WHERE user_id = $1 AND book_id = $2
    `, [userId, bookId]);

    return result.rowCount > 0;
  }

  static async getReadingStats(userId: string): Promise<ReadingStats> {
    const stats = await db.queryOne(`
      WITH stats AS (
        SELECT 
          COUNT(*) FILTER (WHERE l.status = 'completed' OR rp.status = 'completed') as books_read,
          COUNT(*) as total_books,
          AVG(COALESCE(rp.progress, 0)) as avg_progress
        FROM "user".library l
        LEFT JOIN "user".reading_progress rp 
          ON l.user_id = rp.user_id 
          AND l.book_id = rp.book_id
        WHERE l.user_id = $1
      )
      SELECT 
        books_read,
        total_books,
        ROUND(COALESCE(avg_progress, 0)::numeric, 2) as progress_percentage
      FROM stats
    `, [userId]);

    return {
      booksRead: parseInt(stats.books_read),
      totalBooksInList: parseInt(stats.total_books),
      progressPercentage: parseFloat(stats.progress_percentage)
    };
  }

}