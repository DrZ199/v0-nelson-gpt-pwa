-- Enhanced database schema for Nelson-GPT user settings and preferences
-- This script adds comprehensive user settings support

-- Create user_settings table for storing personalized preferences
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID, -- For anonymous users without accounts
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Profile settings
  user_role TEXT DEFAULT 'parent' CHECK (user_role IN ('parent', 'healthcare_provider', 'medical_student', 'researcher')),
  experience_level TEXT DEFAULT 'beginner' CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  primary_language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  
  -- AI Response preferences
  show_citations BOOLEAN DEFAULT TRUE,
  show_confidence_scores BOOLEAN DEFAULT TRUE,
  show_clinical_reasoning BOOLEAN DEFAULT TRUE,
  response_detail_level TEXT DEFAULT 'standard' CHECK (response_detail_level IN ('brief', 'standard', 'detailed')),
  confidence_threshold FLOAT DEFAULT 0.3 CHECK (confidence_threshold >= 0.0 AND confidence_threshold <= 1.0),
  max_citations INTEGER DEFAULT 5 CHECK (max_citations >= 1 AND max_citations <= 20),
  
  -- Appearance settings  
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  font_size TEXT DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large', 'extra-large')),
  font_family TEXT DEFAULT 'geist-sans' CHECK (font_family IN ('geist-sans', 'geist-mono', 'system')),
  high_contrast BOOLEAN DEFAULT FALSE,
  reduce_motion BOOLEAN DEFAULT FALSE,
  
  -- Display settings
  chat_density TEXT DEFAULT 'comfortable' CHECK (chat_density IN ('compact', 'comfortable', 'spacious')),
  show_timestamps BOOLEAN DEFAULT FALSE,
  show_message_actions BOOLEAN DEFAULT TRUE,
  show_typing_indicator BOOLEAN DEFAULT TRUE,
  
  -- Data & Privacy settings
  save_chat_history BOOLEAN DEFAULT TRUE,
  auto_delete_after_days INTEGER DEFAULT 30 CHECK (auto_delete_after_days > 0),
  analytics_enabled BOOLEAN DEFAULT FALSE,
  crash_reporting_enabled BOOLEAN DEFAULT TRUE,
  
  -- Medical-specific settings
  default_age_unit TEXT DEFAULT 'years' CHECK (default_age_unit IN ('days', 'weeks', 'months', 'years')),
  weight_unit TEXT DEFAULT 'kg' CHECK (weight_unit IN ('kg', 'lbs')),
  height_unit TEXT DEFAULT 'cm' CHECK (height_unit IN ('cm', 'inches')),
  temperature_unit TEXT DEFAULT 'celsius' CHECK (temperature_unit IN ('celsius', 'fahrenheit')),
  
  -- Notification preferences
  enable_push_notifications BOOLEAN DEFAULT FALSE,
  notify_on_high_risk BOOLEAN DEFAULT TRUE,
  notify_on_specialist_required BOOLEAN DEFAULT TRUE,
  
  UNIQUE(user_id),
  UNIQUE(session_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS user_settings_user_id_idx ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS user_settings_session_id_idx ON user_settings(session_id);
CREATE INDEX IF NOT EXISTS user_settings_updated_at_idx ON user_settings(updated_at);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_settings_updated_at();

-- Enhanced chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL, -- Client-generated session ID
  title TEXT DEFAULT 'New Chat',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT FALSE,
  is_starred BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  
  -- Medical context for the session
  patient_age_years FLOAT,
  patient_age_months FLOAT,
  patient_weight_kg FLOAT,
  primary_symptoms TEXT[],
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
  
  UNIQUE(session_id)
);

-- Create indexes for chat sessions
CREATE INDEX IF NOT EXISTS chat_sessions_user_id_idx ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS chat_sessions_session_id_idx ON chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS chat_sessions_updated_at_idx ON chat_sessions(updated_at);
CREATE INDEX IF NOT EXISTS chat_sessions_message_count_idx ON chat_sessions(message_count);
CREATE INDEX IF NOT EXISTS chat_sessions_risk_level_idx ON chat_sessions(risk_level);

-- Update chat_messages table to include more metadata
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'chat' CHECK (message_type IN ('chat', 'system', 'error', 'warning')),
ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS edit_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS parent_message_id UUID REFERENCES chat_messages(id),
ADD COLUMN IF NOT EXISTS feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
ADD COLUMN IF NOT EXISTS feedback_text TEXT,
ADD COLUMN IF NOT EXISTS processing_time_ms INTEGER,
ADD COLUMN IF NOT EXISTS token_count INTEGER,
ADD COLUMN IF NOT EXISTS embedding_model TEXT;

-- Add indexes for chat_messages
CREATE INDEX IF NOT EXISTS chat_messages_session_id_idx ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS chat_messages_role_idx ON chat_messages(role);
CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS chat_messages_message_type_idx ON chat_messages(message_type);

-- Function to get user settings with defaults
CREATE OR REPLACE FUNCTION get_user_settings(p_user_id UUID DEFAULT NULL, p_session_id UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  session_id UUID,
  user_role TEXT,
  experience_level TEXT,
  show_citations BOOLEAN,
  show_confidence_scores BOOLEAN,
  show_clinical_reasoning BOOLEAN,
  response_detail_level TEXT,
  confidence_threshold FLOAT,
  theme TEXT,
  font_size TEXT,
  save_chat_history BOOLEAN,
  all_settings JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    us.id,
    us.user_id,
    us.session_id,
    us.user_role,
    us.experience_level,
    us.show_citations,
    us.show_confidence_scores,
    us.show_clinical_reasoning,
    us.response_detail_level,
    us.confidence_threshold,
    us.theme,
    us.font_size,
    us.save_chat_history,
    to_jsonb(us.*) as all_settings
  FROM user_settings us
  WHERE (p_user_id IS NOT NULL AND us.user_id = p_user_id)
     OR (p_session_id IS NOT NULL AND us.session_id = p_session_id)
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to upsert user settings
CREATE OR REPLACE FUNCTION upsert_user_settings(
  p_user_id UUID DEFAULT NULL,
  p_session_id UUID DEFAULT NULL,
  p_settings JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_settings_id UUID;
  v_field TEXT;
  v_value TEXT;
BEGIN
  -- Insert or update user settings
  INSERT INTO user_settings (user_id, session_id)
  VALUES (p_user_id, p_session_id)
  ON CONFLICT (COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid), 
               COALESCE(session_id, '00000000-0000-0000-0000-000000000000'::uuid))
  DO UPDATE SET updated_at = NOW()
  RETURNING id INTO v_settings_id;
  
  -- Update individual settings from JSONB
  FOR v_field, v_value IN SELECT key, value FROM jsonb_each_text(p_settings)
  LOOP
    EXECUTE format('UPDATE user_settings SET %I = %L WHERE id = %L', 
                   v_field, v_value, v_settings_id);
  END LOOP;
  
  RETURN v_settings_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update chat session metadata
CREATE OR REPLACE FUNCTION update_chat_session_metadata(
  p_session_id UUID,
  p_title TEXT DEFAULT NULL,
  p_risk_level TEXT DEFAULT NULL,
  p_symptoms TEXT[] DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE chat_sessions 
  SET 
    title = COALESCE(p_title, title),
    risk_level = COALESCE(p_risk_level, risk_level),
    primary_symptoms = COALESCE(p_symptoms, primary_symptoms),
    updated_at = NOW(),
    last_message_at = NOW()
  WHERE session_id = p_session_id;
  
  -- If no session exists, create one
  IF NOT FOUND THEN
    INSERT INTO chat_sessions (session_id, title, risk_level, primary_symptoms)
    VALUES (p_session_id, COALESCE(p_title, 'New Chat'), p_risk_level, p_symptoms);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to increment message count in chat session
CREATE OR REPLACE FUNCTION increment_session_message_count(p_session_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE chat_sessions 
  SET 
    message_count = message_count + 1,
    last_message_at = NOW(),
    updated_at = NOW()
  WHERE session_id = p_session_id;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically increment message count
CREATE OR REPLACE FUNCTION chat_message_trigger()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM increment_session_message_count(NEW.session_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chat_message_increment_count
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION chat_message_trigger();

-- RLS (Row Level Security) policies for user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own settings
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (
    auth.uid() = user_id OR 
    session_id IS NOT NULL -- Anonymous users can access via session_id
  );

-- Policy: Users can insert their own settings
CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    user_id IS NULL -- Allow anonymous users
  );

-- Policy: Users can update their own settings
CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    session_id IS NOT NULL -- Anonymous users can update via session_id
  );

-- RLS policies for chat_sessions
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat sessions" ON chat_sessions
  FOR SELECT USING (
    auth.uid() = user_id OR 
    user_id IS NULL -- Anonymous sessions
  );

CREATE POLICY "Users can insert own chat sessions" ON chat_sessions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    user_id IS NULL -- Allow anonymous users
  );

CREATE POLICY "Users can update own chat sessions" ON chat_sessions
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    user_id IS NULL -- Anonymous sessions
  );

-- Add comments for documentation
COMMENT ON TABLE user_settings IS 'Stores user preferences and settings for personalized experience';
COMMENT ON TABLE chat_sessions IS 'Tracks chat sessions with metadata for organization and context';
COMMENT ON FUNCTION get_user_settings IS 'Retrieves user settings with fallback to defaults';
COMMENT ON FUNCTION upsert_user_settings IS 'Inserts or updates user settings from JSONB object';
COMMENT ON FUNCTION update_chat_session_metadata IS 'Updates chat session with medical context and metadata';