import { Field, ObjectType, ID, Int } from 'type-graphql';

@ObjectType({ description: 'Notable quote from a book' })
export class Quote {
  @Field(() => ID, { 
    description: 'Unique identifier of the quote' 
  })
  id: string;

  @Field(() => ID, { 
    description: 'Book this quote belongs to' 
  })
  book_id: string;

  @Field(() => String, { 
    description: 'The quoted text' 
  })
  text: string;

  @Field(() => String, { 
    nullable: true,
    description: 'Author or speaker of the quote' 
  })
  author?: string;

  @Field(() => Int, { 
    nullable: true,
    description: 'Page number where the quote appears' 
  })
  page_number?: number;

  @Field(() => Int, { 
    nullable: true,
    description: 'Sort order for displaying quotes' 
  })
  order_index?: number;

  @Field(() => Date, { 
    description: 'When this quote was added' 
  })
  created_at: Date;
}