import { Field, ObjectType, Int } from 'type-graphql';

@ObjectType()
export class ReadingProgress {
  @Field(() => Int)
  progress: number;

  @Field(() => Int, { nullable: true })
  current_page?: number;

  @Field(() => Date, { nullable: true })
  last_read_at?: Date;
}