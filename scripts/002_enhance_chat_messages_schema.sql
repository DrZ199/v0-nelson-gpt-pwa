-- Add reasoning column to chat_messages table for storing clinical decision support data
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS reasoning JSONB;

-- Create index on reasoning column for efficient queries
CREATE INDEX IF NOT EXISTS chat_messages_reasoning_idx 
ON chat_messages 
USING gin(reasoning);

-- Add confidence score extraction function
CREATE OR REPLACE FUNCTION extract_confidence_score(reasoning_data JSONB)
RETURNS FLOAT
LANGUAGE sql IMMUTABLE
AS $$
  SELECT COALESCE((reasoning_data->>'confidence_score')::float, 0.0);
$$;

-- Add risk level extraction function  
CREATE OR REPLACE FUNCTION extract_risk_level(reasoning_data JSONB)
RETURNS TEXT
LANGUAGE sql IMMUTABLE
AS $$
  SELECT COALESCE(reasoning_data->>'risk_level', 'unknown');
$$;
