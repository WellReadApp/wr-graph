import { Resolver, FieldResolver, Root } from 'type-graphql';
import { BookGenre } from '../types/BookGenre';
import { Genre } from '../types/Genre';
import { Book } from '../types/Book';
import { BookService } from '../service';

@Resolver(_of => BookGenre)
export class BookGenreResolver {
  @FieldResolver(() => Genre, {
    description: 'Get the genre details'
  })
  async genre(@Root() bookGenre: BookGenre): Promise<Genre | null> {
    return await BookService.getGenre(bookGenre.genre_id);
  }

  @FieldResolver(() => Book, {
    description: 'Get the book details'
  })
  async book(@Root() bookGenre: BookGenre): Promise<Book | null> {
    return await BookService.getBook(bookGenre.book_id);
  }
}