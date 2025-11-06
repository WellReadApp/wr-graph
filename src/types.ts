export interface Book {
  id: string;
  created_at: Date;
  updated_at: Date;
  url: string | null;
  alias: string | null;
  title: string | null;
  cover_edition_key: string | null;
  primary_author_name: string | null;
  status: string | null;
  description: string | null;
  type: string | null;
  genres: string[] | null;
  summary: string | null;
  key_points: string[] | null;
  similar_books: string[] | null;
  first_publish_year: number | null;
  readinglog_count: number | null;
  picture_url: string | null;
  quotes: string[] | null;
}
