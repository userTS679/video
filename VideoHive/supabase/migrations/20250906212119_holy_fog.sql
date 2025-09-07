/*
  # Initial Schema Setup for ChillConnect Social Video App

  1. New Tables
    - `users` - User profiles with verification status
    - `user_preferences` - Matching preferences and filters
    - `calls` - Call sessions and friend press tracking
    - `friendships` - Mutual friend relationships
    - `conversations` - Chat conversations between friends
    - `messages` - Individual messages in conversations
    - `reports` - Safety reporting system
    - `icebreaker_prompts` - AI-generated conversation starters
    - `mini_game_sessions` - In-call game tracking
    - `moderation_logs` - Content moderation history
    - `trivia_questions` - Quiz game questions

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Separate policies for user data access

  3. Functions & Triggers
    - Auto-update timestamps
    - Friendship creation logic
    - User presence tracking
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE call_status AS ENUM ('waiting', 'connecting', 'connected', 'ended', 'reported', 'canceled');
CREATE TYPE mini_game_type AS ENUM ('rock_paper_scissors', 'trivia', 'emoji_guess');
CREATE TYPE report_reason AS ENUM ('inappropriate_behavior', 'harassment', 'spam', 'fake_profile', 'underage', 'other');

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  phone text UNIQUE,
  display_name text NOT NULL,
  username text UNIQUE,
  date_of_birth date,
  gender text,
  pronouns text,
  bio text,
  interests text[] DEFAULT '{}',
  college text,
  location text,
  profile_photo_url text,
  selfie_verified boolean DEFAULT false,
  is_online boolean DEFAULT false,
  last_seen timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  preferred_genders text[] DEFAULT '{}',
  preferred_age_min integer DEFAULT 18,
  preferred_age_max integer DEFAULT 30,
  preferred_locations text[] DEFAULT '{}',
  preferred_interests text[] DEFAULT '{}',
  languages text[] DEFAULT '{"english"}',
  max_distance_km integer DEFAULT 50,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Calls table
CREATE TABLE IF NOT EXISTS calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_name text NOT NULL UNIQUE,
  caller_id uuid REFERENCES users(id) ON DELETE CASCADE,
  callee_id uuid REFERENCES users(id) ON DELETE CASCADE,
  status call_status DEFAULT 'waiting',
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  duration_seconds integer DEFAULT 0,
  friend_press_caller boolean DEFAULT false,
  friend_press_callee boolean DEFAULT false,
  caller_rating integer CHECK (caller_rating >= 1 AND caller_rating <= 5),
  callee_rating integer CHECK (callee_rating >= 1 AND callee_rating <= 5),
  created_at timestamptz DEFAULT now()
);

-- Friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id uuid REFERENCES users(id) ON DELETE CASCADE,
  user_b_id uuid REFERENCES users(id) ON DELETE CASCADE,
  call_id uuid REFERENCES calls(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_a_id, user_b_id),
  CHECK (user_a_id != user_b_id)
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id uuid REFERENCES users(id) ON DELETE CASCADE,
  user_b_id uuid REFERENCES users(id) ON DELETE CASCADE,
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_a_id, user_b_id),
  CHECK (user_a_id != user_b_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  message_type text DEFAULT 'text',
  attachments jsonb DEFAULT '[]',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  call_id uuid REFERENCES calls(id),
  reason report_reason NOT NULL,
  description text,
  evidence_urls text[] DEFAULT '{}',
  status text DEFAULT 'pending',
  resolved boolean DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Icebreaker prompts table
CREATE TABLE IF NOT EXISTS icebreaker_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_text text NOT NULL,
  categories text[] DEFAULT '{}',
  language text DEFAULT 'english',
  popularity_score integer DEFAULT 0,
  is_ai_generated boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Mini game sessions table
CREATE TABLE IF NOT EXISTS mini_game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id uuid REFERENCES calls(id) ON DELETE CASCADE,
  game_type mini_game_type NOT NULL,
  game_state jsonb DEFAULT '{}',
  game_result jsonb DEFAULT '{}',
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Trivia questions table
CREATE TABLE IF NOT EXISTS trivia_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  options jsonb NOT NULL,
  correct_answer text NOT NULL,
  category text DEFAULT 'general',
  difficulty text DEFAULT 'medium',
  language text DEFAULT 'english',
  created_at timestamptz DEFAULT now()
);

-- Moderation logs table
CREATE TABLE IF NOT EXISTS moderation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type text NOT NULL,
  item_id uuid NOT NULL,
  user_id uuid REFERENCES users(id),
  content_hash text,
  moderation_result jsonb DEFAULT '{}',
  groq_response jsonb DEFAULT '{}',
  action_taken text,
  confidence_score real,
  flagged boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Matchmaking queue table (for temporary storage)
CREATE TABLE IF NOT EXISTS matchmaking_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '5 minutes')
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE icebreaker_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mini_game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trivia_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE matchmaking_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users policies
CREATE POLICY "Users can read all public profiles"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- User preferences policies
CREATE POLICY "Users can read own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Calls policies
CREATE POLICY "Users can read own calls"
  ON calls FOR SELECT
  TO authenticated
  USING (auth.uid() = caller_id OR auth.uid() = callee_id);

CREATE POLICY "Users can update own calls"
  ON calls FOR UPDATE
  TO authenticated
  USING (auth.uid() = caller_id OR auth.uid() = callee_id);

CREATE POLICY "System can insert calls"
  ON calls FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Friendships policies
CREATE POLICY "Users can read own friendships"
  ON friendships FOR SELECT
  TO authenticated
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

CREATE POLICY "System can create friendships"
  ON friendships FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- Conversations policies
CREATE POLICY "Users can read own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- Messages policies
CREATE POLICY "Users can read messages in own conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
      AND (conversations.user_a_id = auth.uid() OR conversations.user_b_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in own conversations"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
      AND (conversations.user_a_id = auth.uid() OR conversations.user_b_id = auth.uid())
    )
  );

-- Reports policies
CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can read own reports"
  ON reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

-- Icebreaker prompts policies (read-only for users)
CREATE POLICY "Users can read icebreaker prompts"
  ON icebreaker_prompts FOR SELECT
  TO authenticated
  USING (true);

-- Mini game sessions policies
CREATE POLICY "Users can read own game sessions"
  ON mini_game_sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM calls
      WHERE calls.id = call_id
      AND (calls.caller_id = auth.uid() OR calls.callee_id = auth.uid())
    )
  );

CREATE POLICY "Users can create game sessions"
  ON mini_game_sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM calls
      WHERE calls.id = call_id
      AND (calls.caller_id = auth.uid() OR calls.callee_id = auth.uid())
    )
  );

-- Trivia questions policies (read-only for users)
CREATE POLICY "Users can read trivia questions"
  ON trivia_questions FOR SELECT
  TO authenticated
  USING (true);

-- Matchmaking queue policies
CREATE POLICY "Users can manage own queue entries"
  ON matchmaking_queue FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Functions

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create friendship after mutual friend press
CREATE OR REPLACE FUNCTION check_mutual_friend_press()
RETURNS TRIGGER AS $$
DECLARE
  other_user_id uuid;
  other_pressed boolean;
BEGIN
  -- Determine the other user and their press status
  IF NEW.friend_press_caller = true AND OLD.friend_press_caller = false THEN
    other_user_id := NEW.callee_id;
    other_pressed := NEW.friend_press_callee;
  ELSIF NEW.friend_press_callee = true AND OLD.friend_press_callee = false THEN
    other_user_id := NEW.caller_id;
    other_pressed := NEW.friend_press_caller;
  ELSE
    RETURN NEW;
  END IF;

  -- If both users pressed friend, create friendship and conversation
  IF other_pressed = true THEN
    -- Create friendship (ensuring user_a_id < user_b_id for consistency)
    INSERT INTO friendships (user_a_id, user_b_id, call_id)
    VALUES (
      LEAST(NEW.caller_id, NEW.callee_id),
      GREATEST(NEW.caller_id, NEW.callee_id),
      NEW.id
    )
    ON CONFLICT (user_a_id, user_b_id) DO NOTHING;

    -- Create conversation
    INSERT INTO conversations (user_a_id, user_b_id)
    VALUES (
      LEAST(NEW.caller_id, NEW.callee_id),
      GREATEST(NEW.caller_id, NEW.callee_id)
    )
    ON CONFLICT (user_a_id, user_b_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for mutual friend press
CREATE TRIGGER check_mutual_friend_press_trigger
  AFTER UPDATE ON calls
  FOR EACH ROW
  WHEN (OLD.friend_press_caller != NEW.friend_press_caller OR OLD.friend_press_callee != NEW.friend_press_callee)
  EXECUTE FUNCTION check_mutual_friend_press();

-- Clean up expired matchmaking queue entries
CREATE OR REPLACE FUNCTION cleanup_expired_queue_entries()
RETURNS void AS $$
BEGIN
  DELETE FROM matchmaking_queue WHERE expires_at < now();
END;
$$ language 'plpgsql';

-- Seed data

-- Insert sample trivia questions
INSERT INTO trivia_questions (question, options, correct_answer, category) VALUES
('What is the capital of India?', '["Mumbai", "Delhi", "Kolkata", "Chennai"]', 'Delhi', 'geography'),
('Which programming language is known as the "language of the web"?', '["Python", "Java", "JavaScript", "C++"]', 'JavaScript', 'technology'),
('What does "API" stand for?', '["Application Programming Interface", "Advanced Programming Interface", "Automated Programming Interface", "Application Process Interface"]', 'Application Programming Interface', 'technology'),
('Which social media platform is known for short videos?', '["Facebook", "Instagram", "TikTok", "Twitter"]', 'TikTok', 'social_media'),
('What is the most popular mobile operating system in India?', '["iOS", "Android", "Windows", "Linux"]', 'Android', 'technology');

-- Insert sample icebreaker prompts
INSERT INTO icebreaker_prompts (prompt_text, categories, language) VALUES
('If you could have dinner with anyone, dead or alive, who would it be?', '{"general", "fun"}', 'english'),
('What''s the most interesting place you''ve ever visited?', '{"travel", "personal"}', 'english'),
('If you could learn any skill instantly, what would it be?', '{"personal", "goals"}', 'english'),
('What''s your favorite way to spend a weekend?', '{"lifestyle", "personal"}', 'english'),
('What''s the best advice you''ve ever received?', '{"personal", "wisdom"}', 'english'),
('If you could time travel, would you go to the past or future?', '{"fun", "hypothetical"}', 'english'),
('What''s your go-to comfort food?', '{"food", "personal"}', 'english'),
('What''s something you''re proud of but rarely get to talk about?', '{"personal", "achievements"}', 'english');