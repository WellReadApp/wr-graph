import { GraphQLError } from 'graphql';
import { GraphQLScalarType, Kind } from 'graphql';
import { query } from './db.js';
import type { Book } from './types.js';

// DateTime scalar for handling timestamp fields
const dateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime custom scalar type',
  serialize(value: any) {
    if (value instanceof Date) {
      return value.toISOString();
    }
    throw Error('GraphQL DateTime Scalar serializer expected a `Date` object');
  },
  parseValue(value: any) {
    if (typeof value === 'string') {
      return new Date(value);
    }
    throw new Error('GraphQL DateTime Scalar parser expected a `string`');
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

interface BooksArgs {
  limit?: number;
  offset?: number;
  genres?: string[];
  search?: string;
  status?: string;
}

interface BookArgs {
  id: string;
}

export const resolvers = {
  DateTime: dateTimeScalar,

  Query: {
    books: async (_: any, args: BooksArgs): Promise<Book[]> => {
      const { limit = 20, offset = 0, genres, search, status } = args;

      let sqlQuery = 'SELECT * FROM wellread.book WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;

      // Filter by genres (any genre match)
      if (genres && genres.length > 0) {
        sqlQuery += ` AND genres && $${paramIndex}`;
        params.push(genres);
        paramIndex++;
      }

      // Filter by status
      if (status) {
        sqlQuery += ` AND status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }

      // Search by title or author
      if (search) {
        sqlQuery += ` AND (title ILIKE $${paramIndex} OR primary_author_name ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      // Order by popularity (readinglog_count) and add pagination
      sqlQuery += ` ORDER BY readinglog_count DESC NULLS LAST LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      try {
        const result = await query<Book>(sqlQuery, params);
        return result.rows;
      } catch (error) {
        console.error('Error fetching books:', error);
        throw new GraphQLError('Failed to fetch books', {
          extensions: { code: 'DATABASE_ERROR' },
        });
      }
    },

    book: async (_: any, args: BookArgs): Promise<Book | null> => {
      const { id } = args;

      try {
        const result = await query<Book>(
          'SELECT * FROM wellread.book WHERE id = $1',
          [id]
        );

        if (result.rows.length === 0) {
          throw new GraphQLError('Book not found', {
            extensions: { code: 'NOT_FOUND' },
          });
        }

        return result.rows[0];
      } catch (error) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        console.error('Error fetching book:', error);
        throw new GraphQLError('Failed to fetch book', {
          extensions: { code: 'DATABASE_ERROR' },
        });
      }
    },

    genres: async (): Promise<string[]> => {
      try {
        const result = await query<{ genre: string }>(
          'SELECT DISTINCT unnest(genres) as genre FROM wellread.book WHERE genres IS NOT NULL ORDER BY genre'
        );
        return result.rows.map((row) => row.genre);
      } catch (error) {
        console.error('Error fetching genres:', error);
        throw new GraphQLError('Failed to fetch genres', {
          extensions: { code: 'DATABASE_ERROR' },
        });
      }
    },
  },
};
