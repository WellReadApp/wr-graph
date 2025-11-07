import { Field, ObjectType, Int, Float } from 'type-graphql';

@ObjectType({ description: 'Reading progress statistics' })
export class ReadingStats {
  @Field(() => Int, { 
    description: 'Number of books completed' 
  })
  booksRead: number;

  @Field(() => Int, { 
    description: 'Total number of books in reading list' 
  })
  totalBooksInList: number;

  @Field(() => Float, { 
    description: 'Overall reading progress percentage' 
  })
  progressPercentage: number;
}