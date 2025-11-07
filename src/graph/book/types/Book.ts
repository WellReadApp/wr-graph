import { Field, ObjectType, ID, Int } from 'type-graphql';

@ObjectType()
export class Book {
  @Field((_type) => ID, { nullable: false })
  id: string;

  @Field((_type) => Date, { nullable: false })
  created_at: Date;

  @Field((_type) => Date, { nullable: false })
  updated_at: Date;

  @Field((_type) => String, { nullable: true })
  url?: string;

  @Field((_type) => String, { nullable: true })
  alias?: string;

  @Field((_type) => String, { nullable: true })
  title?: string;

  @Field((_type) => String, { nullable: true })
  cover_edition_key?: string;

  @Field((_type) => String, { nullable: true })
  primary_author_name?: string;

  @Field((_type) => String, { nullable: true })
  status?: string;

  @Field((_type) => String, { nullable: true })
  description?: string;

  @Field((_type) => String, { nullable: true })
  type?: string;

  @Field((_type) => String, { nullable: true })
  summary?: string;

  @Field((_type) => String, { nullable: true })
  picture_url?: string;

  @Field((_type) => Int, { nullable: true })
  first_publish_year?: number;

  @Field((_type) => Int, { nullable: true })
  readinglog_count?: number;
}