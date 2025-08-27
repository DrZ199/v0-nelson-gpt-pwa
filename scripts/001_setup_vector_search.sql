-- Enable the pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create or update the match_nelson_chunks function for vector similarity search
CREATE OR REPLACE FUNCTION match_nelson_chunks(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  content text,
  chapter_title text,
  section_title text,
  page_number integer,
  metadata jsonb,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    content,
    chapter_title,
    section_title,
    page_number,
    metadata,
    1 - (embedding <=> query_embedding) AS similarity
  FROM nelson_textbook_chunks
  WHERE 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Create index on embedding column for faster vector searches
CREATE INDEX IF NOT EXISTS nelson_chunks_embedding_idx 
ON nelson_textbook_chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create text search index for fallback searches
CREATE INDEX IF NOT EXISTS nelson_chunks_content_fts_idx
ON nelson_textbook_chunks
USING gin(to_tsvector('english', content));
