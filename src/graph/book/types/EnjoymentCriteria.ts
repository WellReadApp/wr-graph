import { ObjectType, Field, ID } from 'type-graphql';

@ObjectType()
export class EnjoymentCriteria {
  @Field(() => ID)
  id: string;

  @Field()
  book_id: string;

  @Field()
  criteria: string;

  @Field()
  order_index: number;

  @Field()
  created_at: Date;
}