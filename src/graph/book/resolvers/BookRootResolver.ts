import { Resolver, Query, Arg, UseMiddleware, Int } from 'type-graphql';
import { Book } from '@src/graph/book/types/Book';
import { Genre } from '@src/graph/book/types/Genre';
import { BookService } from '@src/graph/book/service';
import { isLoggedIn } from '@src/graph/middleware/helper';

@Resolver((_of) => Book)
export class BookRootResolver {

  @UseMiddleware(isLoggedIn)
  @Query((_returns) => Book, {
    description: 'Get a book by ID',
  })
  async get_book(
    @Arg('id', { description: 'The ID of the book' }) id: string,
  ): Promise<Book> {
    return await BookService.getBook(id);
  }

  @UseMiddleware(isLoggedIn)
  @Query((_returns) => [Book], {
    description: 'Search books by title, author or description',
  })
  async search_books(
    @Arg('query', { description: 'Search query' }) query: string,
    @Arg('limit', (_type) => Int, {
      nullable: true,
      description: 'Number of results to return',
    })
    limit?: number,
    @Arg('offset', (_type) => Int, {
      nullable: true,
      description: 'Number of results to skip',
    })
    offset?: number,
  ): Promise<Book[]> {
    return await BookService.searchBooks(query, limit, offset);
  }

  @UseMiddleware(isLoggedIn)
  @Query((_returns) => [Book], {
    description: 'Get list of popular books',
  })
  async list_popular_books(
    @Arg('limit', (_type) => Int, {
      nullable: true,
      description: 'Number of results to return',
    })
    limit?: number,
    @Arg('offset', (_type) => Int, {
      nullable: true,
      description: 'Number of results to skip',
    })
    offset?: number,
  ): Promise<Book[]> {
    return await BookService.listPopularBooks(limit, offset);
  }

  @UseMiddleware(isLoggedIn)
  @Query((_returns) => [Book], {
    description: 'Get list of recently added books',
  })
  async list_recent_books(
    @Arg('limit', (_type) => Int, {
      nullable: true,
      description: 'Number of results to return',
    })
    limit?: number,
    @Arg('offset', (_type) => Int, {
      nullable: true,
      description: 'Number of results to skip',
    })
    offset?: number,
  ): Promise<Book[]> {
    return await BookService.listRecentBooks(limit, offset);
  }

  @UseMiddleware(isLoggedIn)
  @Query((_returns) => [Genre], {
    description: 'Get list of all active genres that have books'
  })
  async list_genres(): Promise<Genre[]> {
    return await BookService.listGenres();
  }

  @Query(() => [Book], {
    description: 'Get quick search suggestions as you type'
  })
  async search_autocomplete(
    @Arg('query', { description: 'Search text' }) query: string,
    @Arg('limit', () => Int, {
      nullable: true,
      description: 'Maximum number of suggestions'
    }) limit?: number
  ): Promise<Book[]> {
    return await BookService.searchAutocomplete(query, limit);
  }

}