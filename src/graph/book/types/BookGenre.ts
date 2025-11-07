import { Field, ObjectType, ID } from 'type-graphql';

@ObjectType({ description: 'Association between a book and genre' })
export class BookGenre {
  @Field(() => ID, { 
    description: 'Book identifier' 
  })
  book_id: string;

  @Field(() => ID, { 
    description: 'Genre identifier' 
  })
  genre_id: string;

  @Field(() => Date, { 
    description: 'When this association was created' 
  })
  created_at: Date;
}