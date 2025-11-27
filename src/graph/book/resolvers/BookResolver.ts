import { Resolver, FieldResolver, Root, Ctx } from 'type-graphql';
import { Book } from '../types/Book';
import { BookGenre } from '../types/BookGenre';
import { Quote } from '../types/Quote';
import { KeyPoint } from '../types/KeyPoint';
import { LibraryService } from '../../library/service';
import { BookService } from '../service';
import { Context } from '@src/graph/types/Context';
import { Library } from '../../library/types/Library';
import { ReadingProgress } from '../../library/types/ReadingProgress';
import { SummaryPage } from '../types/SummaryPage';
import { EnjoymentCriteria } from '../types/EnjoymentCriteria';
import { ActionableBenefit } from '../types/ActionableBenefit';
import { ContrastingViewpoint } from '../types/ContrastingViewpoint';
import { ActionableStep } from '../types/ActionableStep';
import { BookTheme } from '../types/BookTheme';

@Resolver((_of) => Book)
export class BookResolver {

  @FieldResolver(() => [BookGenre], {
    description: 'Get all genres associated with this book'
  })
  async book_genres(@Root() book: Book): Promise<BookGenre[]> {
    return await BookService.getBookGenres(book.id);
  }

  @FieldResolver(() => [Quote], {
    description: 'Get quotes from this book'
  })
  async quotes(@Root() book: Book): Promise<Quote[]> {
    return await BookService.getBookQuotes(book.id);
  }

  @FieldResolver(() => [KeyPoint], {
    description: 'Get key points from this book'
  })
  async key_points(@Root() book: Book): Promise<KeyPoint[]> {
    return await BookService.getBookKeyPoints(book.id);
  }

  @FieldResolver(() => [Book], {
    description: 'Get similar books recommendations'
  })
  async similar_books(
    @Root() book: Book,
    @Ctx() ctx: Context
  ): Promise<Book[]> {
    return await BookService.getSimilarBooks(book.id);
  }

  @FieldResolver(() => Library, {
    nullable: true,
    description: 'Get user\'s library status and progress for this book'
  })
  async library_status(
    @Root() book: Book,
    @Ctx() ctx: Context
  ): Promise<Library | null> {
    if (!ctx.user_id) return null;
    return await LibraryService.getLibraryEntry(ctx.user_id, book.id);
  }

  @FieldResolver(() => ReadingProgress, {
    nullable: true,
    description: 'Get current user\'s reading progress for this book'
  })
  async reading_progress(
    @Root() book: Book,
    @Ctx() ctx: Context
  ): Promise<ReadingProgress | null> {
    if (!ctx.user_id) return null;
    return await LibraryService.getProgress(ctx.user_id, book.id);
  }

  @FieldResolver(() => [SummaryPage], {
    description: 'Get paginated summary content for this book'
  })
  async summary_pages(@Root() book: Book): Promise<SummaryPage[]> {
    return await BookService.getBookSummaryPages(book.id);
  }

  @FieldResolver(() => [EnjoymentCriteria])
  async enjoyment_criteria(@Root() book: Book): Promise<EnjoymentCriteria[]> {
    return await BookService.getBookEnjoymentCriteria(book.id);
  }

  @FieldResolver(() => [ActionableBenefit])
  async actionable_benefits(@Root() book: Book): Promise<ActionableBenefit[]> {
    return await BookService.getBookActionableBenefits(book.id);
  }

  @FieldResolver(() => [ContrastingViewpoint])
  async contrasting_viewpoints(@Root() book: Book): Promise<ContrastingViewpoint[]> {
    return await BookService.getBookContrastingViewpoints(book.id);
  }

  @FieldResolver(() => [ActionableStep])
  async actionable_steps(@Root() book: Book): Promise<ActionableStep[]> {
    return await BookService.getBookActionableSteps(book.id);
  }

  @FieldResolver(() => [BookTheme])
  async book_themes(@Root() book: Book): Promise<BookTheme[]> {
    return await BookService.getBookThemes(book.id);
  }

}