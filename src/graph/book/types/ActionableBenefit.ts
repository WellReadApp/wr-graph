import { ObjectType, Field, ID } from 'type-graphql';

@ObjectType()
export class ActionableBenefit {
  @Field(() => ID)
  id: string;

  @Field()
  book_id: string;

  @Field()
  benefit: string;

  @Field()
  order_index: number;

  @Field()
  created_at: Date;
}