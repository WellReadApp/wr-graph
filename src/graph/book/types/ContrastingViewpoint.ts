import { ObjectType, Field, ID } from 'type-graphql';

@ObjectType()
export class ContrastingViewpoint {
  @Field(() => ID)
  id: string;

  @Field()
  book_id: string;

  @Field()
  viewpoint: string;

  @Field()
  order_index: number;

  @Field()
  created_at: Date;
}