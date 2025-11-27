import { ObjectType, Field, ID } from 'type-graphql';

@ObjectType()
export class BookTheme {
  @Field(() => ID)
  id: string;

  @Field((_type) => String)
  book_id: string;

  @Field((_type) => String)
  title: string;

  @Field((_type) => String, { nullable: true })
  description: string;

  @Field((_type) => Date)
  created_at: Date;
}