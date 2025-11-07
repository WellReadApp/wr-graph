import { Field, ObjectType, Int } from 'type-graphql';

@ObjectType({ description: 'Statistics about user\'s book library' })
export class LibraryStats {
  @Field(() => Int, { 
    description: 'Total number of books in user\'s library' 
  })
  totalBooks: number;

  @Field(() => Int, { 
    description: 'Number of books currently being read' 
  })
  reading: number;

  @Field(() => Int, { 
    description: 'Number of books completed' 
  })
  completed: number;

  @Field(() => Int, { 
    description: 'Number of books marked as want-to-read' 
  })
  wantToRead: number;
}