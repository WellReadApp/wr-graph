import { Resolver, FieldResolver, Root, Ctx } from 'type-graphql';
import { Library } from '../types/Library';
import { Book } from '../../book/types/Book';
import { ReadingProgress } from '../types/ReadingProgress';
import { BookService } from '../../book/service';
import { LibraryService } from '../service';
import { Context } from '@src/graph/types/Context';

@Resolver((_of) => Library)
export class LibraryResolver {
  @FieldResolver(() => Book, {
    description: 'Get the book details'
  })
  async book(@Root() library: Library): Promise<Book> {
    return await BookService.getBook(library.book_id);
  }

  @FieldResolver(() => ReadingProgress, {
    nullable: true,
    description: 'Get user\'s reading progress for this book'
  })
  async reading_progress(
    @Root() library: Library,
    @Ctx() ctx: Context
  ): Promise<ReadingProgress | null> {
    return await LibraryService.getProgress(ctx.user_id, library.book_id);
  }

  @FieldResolver(() => String, {
    description: 'Determine if user should continue or start reading'
  })
  async action_type(
    @Root() library: Library,
    @Ctx() ctx: Context
  ): Promise<'continue' | 'start'> {
    const progress = await LibraryService.getProgress(ctx.user_id, library.book_id);
    return progress && progress.progress > 0 ? 'continue' : 'start';
  }

  @FieldResolver(() => Date, {
    description: 'Get the last interaction date (last read or added date)'
  })
  async last_interaction(
    @Root() library: Library,
    @Ctx() ctx: Context
  ): Promise<Date> {
    const progress = await LibraryService.getProgress(ctx.user_id, library.book_id);
    return progress?.last_read_at || library.added_at;
  }
}