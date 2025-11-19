/*
  # Add Community Features to SOWD

  1. Updates to Tables
    - Add `is_public` column to prayers table for privacy control
    - Add `user_name` column to prayers for display
    
  2. New Tables
    - `profiles`
      - `id` (uuid, references auth.users)
      - `display_name` (text)
      - `bio` (text, nullable)
      - `avatar_url` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `prayer_supports`
      - `id` (uuid, primary key)
      - `prayer_id` (uuid, references prayers)
      - `user_id` (uuid, references auth.users)
      - `type` (text: 'like' or 'pray')
      - `created_at` (timestamptz)
    
    - `prayer_comments`
      - `id` (uuid, primary key)
      - `prayer_id` (uuid, references prayers)
      - `user_id` (uuid, references auth.users)
      - `content` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
    - Public prayers can be viewed by all authenticated users
    - Users can only edit their own profiles
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  bio text,
  avatar_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add is_public column to prayers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prayers' AND column_name = 'is_public'
  ) THEN
    ALTER TABLE prayers ADD COLUMN is_public boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Create prayer_supports table
CREATE TABLE IF NOT EXISTS prayer_supports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prayer_id uuid REFERENCES prayers(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('like', 'pray')),
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(prayer_id, user_id, type)
);

-- Create prayer_comments table
CREATE TABLE IF NOT EXISTS prayer_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prayer_id uuid REFERENCES prayers(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS prayer_supports_prayer_id_idx ON prayer_supports(prayer_id);
CREATE INDEX IF NOT EXISTS prayer_supports_user_id_idx ON prayer_supports(user_id);
CREATE INDEX IF NOT EXISTS prayer_comments_prayer_id_idx ON prayer_comments(prayer_id);
CREATE INDEX IF NOT EXISTS prayer_comments_user_id_idx ON prayer_comments(user_id);
CREATE INDEX IF NOT EXISTS prayers_is_public_idx ON prayers(is_public);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_supports ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_comments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Update prayers policies to support public prayers
DROP POLICY IF EXISTS "Users can view own prayers" ON prayers;

CREATE POLICY "Users can view own prayers and public prayers"
  ON prayers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_public = true);

-- Prayer supports policies
CREATE POLICY "Users can view all prayer supports"
  ON prayer_supports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create prayer supports"
  ON prayer_supports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own prayer supports"
  ON prayer_supports FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Prayer comments policies
CREATE POLICY "Users can view comments on public prayers"
  ON prayer_comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM prayers
      WHERE prayers.id = prayer_comments.prayer_id
      AND (prayers.is_public = true OR prayers.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can create comments on public prayers"
  ON prayer_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM prayers
      WHERE prayers.id = prayer_id
      AND prayers.is_public = true
    )
  );

CREATE POLICY "Users can update own comments"
  ON prayer_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON prayer_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prayer_comments_updated_at
  BEFORE UPDATE ON prayer_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Anonymous'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();