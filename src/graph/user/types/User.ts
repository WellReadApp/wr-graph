import { Field, ObjectType, ID } from 'type-graphql';

@ObjectType()
export class User {
  @Field((_type) => ID, { nullable: false })
  id: string;

  @Field((_type) => Date, { nullable: false })
  created_at: Date;

  @Field((_type) => Date, { nullable: false })
  updated_at: Date;

  @Field((_type) => String, { nullable: false })
  email: string;
  
  @Field((_type) => String, { nullable: true })
  first_name?: string;

  @Field((_type) => String, { nullable: true })
  last_name?: string;
  
  @Field((_type) => String, { nullable: true })
  picture_url?: string;
}
