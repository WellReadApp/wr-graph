import { Field, ObjectType, ID, Int } from 'type-graphql';

@ObjectType()
export class Library {
  @Field((_type) => ID)
  id: string;

  @Field((_type) => ID)
  user_id: string;

  @Field((_type) => ID)
  book_id: string;

  @Field()
  status: 'reading' | 'completed' | 'want-to-read';

  @Field((_type) => Date)
  added_at: Date;

  @Field((_type) => Date)
  updated_at: Date;
}