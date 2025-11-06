# GraphQL Backend Design Document

## Overview

The GraphQL backend server will be built using Node.js with TypeScript, providing a type-safe API layer for the personal growth book reading application. The server will use Apollo Server for GraphQL implementation, Prisma as the ORM, and PostgreSQL for data persistence.

## Architecture

### Technology Stack
- **Runtime**: Node.js 18+ with TypeScript
- **GraphQL Server**: Apollo Server 4
- **Database**: PostgreSQL (existing wellread database)
- **ORM**: Prisma 5
- **Authentication**: JWT with bcrypt for password hashing
- **Validation**: Zod for input validation
- **Testing**: Jest with GraphQL testing utilities
- **Environment**: Environment-based configuration

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │───▶│  GraphQL API    │───▶│   PostgreSQL    │
│   (Frontend)    │    │ (Node.js Server)│    │  (wellread DB)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Components and Interfaces

### GraphQL Schema Structure

#### Core Types
```graphql
type User {
  id: ID!
  email: String!
  createdAt: DateTime!
  profile: UserProfile!
  readingProgress: [ReadingProgress!]!
  growthPlan: GrowthPlan
  statistics: UserStatistics!
}

type Book {
  id: ID!
  title: String!
  primaryAuthorName: String!
  genres: [String!]!
  coverEditionKey: String
  pictureUrl: String
  description: String
  summary: String
  keyPoints: [String!]!
  quotes: [String!]!
  summaryPages: [BookSummaryPage!]!
  url: String
  alias: String
  type: String
  status: String
  firstPublishYear: Int
  readinglogCount: Int
  similarBooks: [String!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type ReadingProgress {
  id: ID!
  user: User!
  book: Book!
  progress: Float!
  startedAt: DateTime!
  lastReadAt: DateTime!
  completedAt: DateTime
}

type GrowthPlan {
  id: ID!
  user: User!
  currentMilestone: Milestone!
  progress: Float!
  milestones: [Milestone!]!
}

type Milestone {
  id: ID!
  name: String!
  description: String!
  books: [Book!]!
  progress: Float!
  completed: Int!
  total: Int!
  order: Int!
}

type BookSummaryPage {
  id: ID!
  title: String!
  content: String!
  pageOrder: Int!
}

type UserStatistics {
  streak: Int!
  totalMinutes: Int!
  booksCompleted: Int!
  bonusPoints: Int!
  badges: [Badge!]!
}

type Badge {
  id: ID!
  name: String!
  description: String!
  iconUrl: String
  earnedAt: DateTime!
}
```

#### Query Operations
```graphql
type Query {
  # Authentication
  me: User
  
  # Books
  books(
    first: Int
    after: String
    genres: [String!]
    search: String
    status: String
  ): BookConnection!
  book(id: ID!): Book
  genres: [String!]!
  
  # User Progress
  myReadingProgress: [ReadingProgress!]!
  myStatistics: UserStatistics!
  myGrowthPlan: GrowthPlan
  
  # Recommendations
  recommendedBooks(limit: Int = 10): [Book!]!
  continueReading: ReadingProgress
}
```

#### Mutation Operations
```graphql
type Mutation {
  # Authentication
  register(input: RegisterInput!): AuthPayload!
  login(input: LoginInput!): AuthPayload!
  
  # Reading Progress
  startReading(bookId: ID!): ReadingProgress!
  updateProgress(bookId: ID!, progress: Float!): ReadingProgress!
  completeBook(bookId: ID!): ReadingProgress!
  
  # Growth Plans
  enrollInGrowthPlan(planId: ID!): GrowthPlan!
  
  # User Management
  updateProfile(input: UpdateProfileInput!): User!
}
```

## Data Models

### Database Schema Design

#### Core Tables
```sql
-- Users and Authentication
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User Progress Tracking
CREATE TABLE reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  book_id UUID REFERENCES wellread.book(id) ON DELETE CASCADE,
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  started_at TIMESTAMP DEFAULT NOW(),
  last_read_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  UNIQUE(user_id, book_id)
);

-- Growth Plans and Milestones
CREATE TABLE growth_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  total_books INTEGER NOT NULL
);

CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  growth_plan_id UUID REFERENCES growth_plans(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  total_books INTEGER NOT NULL
);

CREATE TABLE user_growth_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  growth_plan_id UUID REFERENCES growth_plans(id),
  current_milestone_id UUID REFERENCES milestones(id),
  enrolled_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, growth_plan_id)
);

-- Badges and Achievements
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon_url VARCHAR(255),
  criteria JSONB NOT NULL
);

CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id),
  earned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Book Summary Pages (if needed for structured content)
CREATE TABLE book_summary_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES wellread.book(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  page_order INTEGER NOT NULL
);
```

### TypeScript Interfaces
```typescript
interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Book {
  id: string;
  title: string;
  primaryAuthorName: string;
  genres: string[];
  coverEditionKey?: string;
  pictureUrl?: string;
  description?: string;
  summary?: string;
  keyPoints: string[];
  quotes: string[];
  url?: string;
  alias?: string;
  type?: string;
  status?: string;
  firstPublishYear?: number;
  readinglogCount?: number;
  similarBooks: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface ReadingProgress {
  id: string;
  userId: string;
  bookId: string;
  progressPercentage: number;
  startedAt: Date;
  lastReadAt: Date;
  completedAt?: Date;
}

interface UserStatistics {
  streak: number;
  totalMinutes: number;
  booksCompleted: number;
  bonusPoints: number;
  badges: Badge[];
}
```

### Service Layer Architecture

#### Authentication Service
- JWT token generation and validation
- Password hashing with bcrypt
- Session management
- Rate limiting for login attempts

#### Book Service
- Book CRUD operations
- Search and filtering logic
- Category management
- Content delivery optimization

#### Progress Service
- Reading progress tracking
- Statistics calculation
- Streak computation
- Badge award logic

#### Growth Plan Service
- Milestone progress calculation
- Plan enrollment management
- Recommendation algorithms
- Achievement tracking

## Error Handling

### GraphQL Error Categories
1. **Authentication Errors**: Invalid tokens, expired sessions
2. **Validation Errors**: Invalid input data, constraint violations
3. **Authorization Errors**: Insufficient permissions
4. **Not Found Errors**: Requested resources don't exist
5. **Internal Errors**: Database failures, external service issues

### Error Response Format
```typescript
interface GraphQLError {
  message: string;
  code: string;
  path?: string[];
  extensions?: {
    code: string;
    field?: string;
    details?: any;
  };
}
```

## Testing Strategy

### Unit Testing
- Service layer business logic
- GraphQL resolver functions
- Database query operations
- Authentication utilities

### Integration Testing
- End-to-end GraphQL operations
- Database transaction handling
- Authentication flow testing
- Progress calculation accuracy

### Performance Testing
- Query response times under load
- Database connection pooling
- Memory usage optimization
- Concurrent user handling

### Test Data Management
- Seed data for development
- Test database isolation
- Mock external services
- Automated test cleanup

## Security Considerations

### Authentication & Authorization
- JWT token expiration and refresh
- Role-based access control
- Rate limiting on sensitive operations
- Input sanitization and validation

### Data Protection
- Password hashing with salt
- SQL injection prevention via Prisma
- CORS configuration for frontend
- Environment variable security

### API Security
- Query depth limiting
- Query complexity analysis
- Request size limitations
- GraphQL introspection in production