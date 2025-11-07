import { Field, ObjectType, ID } from 'type-graphql';

@ObjectType({ description: 'Book genre category' })
export class Genre {
  @Field(() => ID, { 
    description: 'Unique identifier of the genre' 
  })
  id: string;

  @Field(() => String, { 
    description: 'Name of the genre' 
  })
  name: string;

  @Field(() => Date, { 
    description: 'When this genre was created' 
  })
  created_at: Date;
}