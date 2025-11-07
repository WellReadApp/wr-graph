import { Resolver, Query, Mutation, Arg, Ctx, UseMiddleware } from 'type-graphql';
import { Library } from '../types/Library';
import { LibraryStats } from '../types/LibraryStats';
import { ReadingStats } from '../types/ReadingStats';
import { LibraryService } from '../service';
import { isLoggedIn } from '@src/graph/middleware/helper';
import { Context } from '@src/graph/types/Context';

@Resolver()
export class LibraryRootResolver {

  @UseMiddleware(isLoggedIn)
  @Query(() => [Library], {
    description: 'Get user\'s complete library'
  })
  async get_library(@Ctx() ctx: Context): Promise<Library[]> {
    return await LibraryService.getUserLibrary(ctx.user_id);
  }

  @UseMiddleware(isLoggedIn)
  @Query(() => [Library], {
    description: 'Get user\'s books by status'
  })
  async get_library_by_status(
    @Ctx() ctx: Context,
    @Arg('status', { description: 'Filter by reading status' })
    status: 'reading' | 'completed' | 'want-to-read'
  ): Promise<Library[]> {
    return await LibraryService.getLibraryByStatus(ctx.user_id, status);
  }

  @UseMiddleware(isLoggedIn)
  @Query(() => LibraryStats, {
    description: 'Get user\'s library statistics'
  })
  async get_library_stats(@Ctx() ctx: Context): Promise<LibraryStats> {
    return await LibraryService.getLibraryStats(ctx.user_id);
  }

  @UseMiddleware(isLoggedIn)
  @Query(() => Library, {
    description: 'Get user\'s most recently read book that is still in progress',
    nullable: true
  })
  async get_current_book(@Ctx() ctx: Context): Promise<Library | null> {
    return await LibraryService.getLastReadingBook(ctx.user_id);
  }

  @UseMiddleware(isLoggedIn)
  @Query(() => ReadingStats, {
    description: 'Get user\'s reading progress statistics'
  })
  async get_reading_stats(@Ctx() ctx: Context): Promise<ReadingStats> {
    return await LibraryService.getReadingStats(ctx.user_id);
  }

  @UseMiddleware(isLoggedIn)
  @Mutation(() => Library, {
    description: 'Add a book to user\'s library'
  })
  async add_to_library(
    @Ctx() ctx: Context,
    @Arg('bookId') bookId: string,
    @Arg('status', { defaultValue: 'want-to-read' })
    status: 'reading' | 'completed' | 'want-to-read'
  ): Promise<Library> {
    return await LibraryService.addToLibrary(ctx.user_id, bookId, status);
  }

  @UseMiddleware(isLoggedIn)
  @Mutation(() => Library, {
    description: 'Update book status in library'
  })
  async update_library_status(
    @Ctx() ctx: Context,
    @Arg('bookId') bookId: string,
    @Arg('status') status: 'reading' | 'completed' | 'want-to-read'
  ): Promise<Library> {
    return await LibraryService.updateStatus(ctx.user_id, bookId, status);
  }

  @UseMiddleware(isLoggedIn)
  @Mutation(() => Boolean, {
    description: 'Remove book from library'
  })
  async remove_from_library(
    @Ctx() ctx: Context,
    @Arg('bookId') bookId: string
  ): Promise<boolean> {
    return await LibraryService.removeFromLibrary(ctx.user_id, bookId);
  }
}