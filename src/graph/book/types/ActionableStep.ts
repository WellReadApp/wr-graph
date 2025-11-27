import { ObjectType, Field, ID } from 'type-graphql';

@ObjectType()
export class ActionableStep {
  @Field(() => ID)
  id: string;

  @Field()
  book_id: string;

  @Field()
  step: string;

  @Field()
  order_index: number;

  @Field()
  created_at: Date;
}