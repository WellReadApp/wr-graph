import { Field, ObjectType, ID, Int } from 'type-graphql';

@ObjectType({ description: 'Key learning point from a book' })
export class KeyPoint {
  @Field(() => ID, { 
    description: 'Unique identifier of the key point' 
  })
  id: string;

  @Field(() => ID, { 
    description: 'Book this key point belongs to' 
  })
  book_id: string;

  @Field(() => String, { 
    description: 'The main point or learning' 
  })
  point: string;

  @Field(() => Int, { 
    description: 'Sort order for displaying key points' 
  })
  order_index: number;

  @Field(() => Date, { 
    description: 'When this key point was added' 
  })
  created_at: Date;
}