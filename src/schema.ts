export const typeDefs = `#graphql
  scalar DateTime

  type Book {
    id: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
    url: String
    alias: String
    title: String
    coverEditionKey: String
    primaryAuthorName: String
    status: String
    description: String
    type: String
    genres: [String!]
    summary: String
    keyPoints: [String!]
    similarBooks: [String!]
    firstPublishYear: Int
    readinglogCount: Int
    pictureUrl: String
    quotes: [String!]
  }

  type Query {
    """
    Get a list of books with optional filtering and pagination
    """
    books(
      limit: Int = 20
      offset: Int = 0
      genres: [String!]
      search: String
      status: String
    ): [Book!]!

    """
    Get a single book by ID
    """
    book(id: ID!): Book

    """
    Get all unique genres available in the database
    """
    genres: [String!]!
  }
`;
