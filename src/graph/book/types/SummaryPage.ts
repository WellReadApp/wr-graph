import { Field, ObjectType, ID, Int } from 'type-graphql';

@ObjectType({ description: 'A page of book summary content' })
export class SummaryPage {
  @Field(() => ID, { 
    description: 'Unique identifier of the summary page' 
  })
  id: string;

  @Field(() => ID, { 
    description: 'Book this summary belongs to' 
  })
  book_id: string;

  @Field(() => String, { 
    description: 'The summary content' 
  })
  content: string;

  @Field(() => Int, { 
    description: 'Page number for ordering' 
  })
  page_number: number;

  @Field(() => Date, { 
    description: 'When this summary was created' 
  })
  created_at: Date;
}