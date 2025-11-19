/*
  # Create Seeds of Word and Deed (SOWD) Schema

  1. New Tables
    - `prayers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `content` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `seeds`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `prayer_id` (uuid, references prayers, nullable)
      - `type` (text: 'word' or 'deed')
      - `description` (text)
      - `completed` (boolean)
      - `completed_at` (timestamptz, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Users can only read/write their own prayers and seeds

  3. Important Notes
    - Seeds can be linked to prayers (optional relationship)
    - Track both words (prayers, encouragement) and deeds (actions)
    - Garden visualization will be based on completed seeds
*/

-- Create prayers table
CREATE TABLE IF NOT EXISTS prayers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create seeds table
CREATE TABLE IF NOT EXISTS seeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prayer_id uuid REFERENCES prayers(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('word', 'deed')),
  description text NOT NULL,
  completed boolean DEFAULT false NOT NULL,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS prayers_user_id_idx ON prayers(user_id);
CREATE INDEX IF NOT EXISTS prayers_created_at_idx ON prayers(created_at DESC);
CREATE INDEX IF NOT EXISTS seeds_user_id_idx ON seeds(user_id);
CREATE INDEX IF NOT EXISTS seeds_prayer_id_idx ON seeds(prayer_id);
CREATE INDEX IF NOT EXISTS seeds_completed_idx ON seeds(completed);

-- Enable Row Level Security
ALTER TABLE prayers ENABLE ROW LEVEL SECURITY;
ALTER TABLE seeds ENABLE ROW LEVEL SECURITY;

-- Prayers policies
CREATE POLICY "Users can view own prayers"
  ON prayers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own prayers"
  ON prayers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prayers"
  ON prayers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own prayers"
  ON prayers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Seeds policies
CREATE POLICY "Users can view own seeds"
  ON seeds FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own seeds"
  ON seeds FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own seeds"
  ON seeds FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own seeds"
  ON seeds FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_prayers_updated_at
  BEFORE UPDATE ON prayers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seeds_updated_at
  BEFORE UPDATE ON seeds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();