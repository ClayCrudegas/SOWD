/*
  # Phase 5 Features - Extended Community & Personalization

  1. New Tables
    - `prayer_circles` - Prayer groups
    - `prayer_circle_members` - Members of prayer circles
    - `circle_prayers` - Prayers shared in circles
    - `guided_prayer_templates` - Prayer templates
    - `meditation_sessions` - Breathing/meditation sessions
    - `user_themes` - Custom user themes
    - `scripture_favorites` - Saved Bible verses
    - `prayer_reminders` - Notification reminders

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated and guest users
*/

-- Prayer Circles
CREATE TABLE IF NOT EXISTS prayer_circles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  creator_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url text,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Prayer Circle Members
CREATE TABLE IF NOT EXISTS prayer_circle_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id uuid REFERENCES prayer_circles(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(circle_id, user_id)
);

-- Circle Prayers
CREATE TABLE IF NOT EXISTS circle_prayers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id uuid REFERENCES prayer_circles(id) ON DELETE CASCADE NOT NULL,
  prayer_id uuid REFERENCES prayers(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(circle_id, prayer_id)
);

-- Guided Prayer Templates
CREATE TABLE IF NOT EXISTS guided_prayer_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  prompts jsonb NOT NULL DEFAULT '[]',
  estimated_duration integer DEFAULT 5,
  created_at timestamptz DEFAULT now()
);

-- Meditation Sessions
CREATE TABLE IF NOT EXISTS meditation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_id text,
  duration integer NOT NULL,
  type text DEFAULT 'breathing' CHECK (type IN ('breathing', 'meditation')),
  completed_at timestamptz DEFAULT now()
);

-- User Themes
CREATE TABLE IF NOT EXISTS user_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_id text,
  theme_name text NOT NULL,
  colors jsonb NOT NULL DEFAULT '{}',
  background_image_url text,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Scripture Favorites
CREATE TABLE IF NOT EXISTS scripture_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_id text,
  book text NOT NULL,
  chapter integer NOT NULL,
  verse integer NOT NULL,
  text text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Prayer Reminders
CREATE TABLE IF NOT EXISTS prayer_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_id text,
  time_of_day time NOT NULL,
  days_of_week jsonb DEFAULT '["mon","tue","wed","thu","fri","sat","sun"]',
  message text DEFAULT 'Time to pray 🙏',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE prayer_circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_prayers ENABLE ROW LEVEL SECURITY;
ALTER TABLE guided_prayer_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripture_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_reminders ENABLE ROW LEVEL SECURITY;

-- Prayer Circles Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prayer_circles' AND policyname = 'Anyone can view public circles') THEN
    CREATE POLICY "Anyone can view public circles"
      ON prayer_circles FOR SELECT
      USING (is_public = true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prayer_circles' AND policyname = 'Members can view private circles') THEN
    CREATE POLICY "Members can view private circles"
      ON prayer_circles FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM prayer_circle_members
          WHERE prayer_circle_members.circle_id = prayer_circles.id
          AND prayer_circle_members.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prayer_circles' AND policyname = 'Authenticated users can create circles') THEN
    CREATE POLICY "Authenticated users can create circles"
      ON prayer_circles FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = creator_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prayer_circles' AND policyname = 'Creators can update their circles') THEN
    CREATE POLICY "Creators can update their circles"
      ON prayer_circles FOR UPDATE
      TO authenticated
      USING (auth.uid() = creator_id)
      WITH CHECK (auth.uid() = creator_id);
  END IF;
END $$;

-- Prayer Circle Members Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prayer_circle_members' AND policyname = 'Members can view circle membership') THEN
    CREATE POLICY "Members can view circle membership"
      ON prayer_circle_members FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM prayer_circle_members pcm
          WHERE pcm.circle_id = prayer_circle_members.circle_id
          AND pcm.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prayer_circle_members' AND policyname = 'Users can join public circles') THEN
    CREATE POLICY "Users can join public circles"
      ON prayer_circle_members FOR INSERT
      TO authenticated
      WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
          SELECT 1 FROM prayer_circles
          WHERE prayer_circles.id = circle_id
          AND prayer_circles.is_public = true
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prayer_circle_members' AND policyname = 'Users can leave circles') THEN
    CREATE POLICY "Users can leave circles"
      ON prayer_circle_members FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Circle Prayers Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'circle_prayers' AND policyname = 'Circle members can view circle prayers') THEN
    CREATE POLICY "Circle members can view circle prayers"
      ON circle_prayers FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM prayer_circle_members
          WHERE prayer_circle_members.circle_id = circle_prayers.circle_id
          AND prayer_circle_members.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'circle_prayers' AND policyname = 'Circle members can add prayers') THEN
    CREATE POLICY "Circle members can add prayers"
      ON circle_prayers FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM prayer_circle_members
          WHERE prayer_circle_members.circle_id = circle_prayers.circle_id
          AND prayer_circle_members.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Guided Prayer Templates Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'guided_prayer_templates' AND policyname = 'Anyone can view prayer templates') THEN
    CREATE POLICY "Anyone can view prayer templates"
      ON guided_prayer_templates FOR SELECT
      USING (true);
  END IF;
END $$;

-- Meditation Sessions Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meditation_sessions' AND policyname = 'Users can view own meditation sessions') THEN
    CREATE POLICY "Users can view own meditation sessions"
      ON meditation_sessions FOR SELECT
      USING (
        (auth.uid() IS NOT NULL AND auth.uid() = user_id)
        OR (auth.uid() IS NULL AND guest_id IS NOT NULL)
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meditation_sessions' AND policyname = 'Users can create meditation sessions') THEN
    CREATE POLICY "Users can create meditation sessions"
      ON meditation_sessions FOR INSERT
      WITH CHECK (
        (auth.uid() IS NOT NULL AND auth.uid() = user_id)
        OR (auth.uid() IS NULL AND guest_id IS NOT NULL)
      );
  END IF;
END $$;

-- User Themes Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_themes' AND policyname = 'Users can view own themes') THEN
    CREATE POLICY "Users can view own themes"
      ON user_themes FOR SELECT
      USING (
        (auth.uid() IS NOT NULL AND auth.uid() = user_id)
        OR (auth.uid() IS NULL AND guest_id IS NOT NULL)
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_themes' AND policyname = 'Users can create themes') THEN
    CREATE POLICY "Users can create themes"
      ON user_themes FOR INSERT
      WITH CHECK (
        (auth.uid() IS NOT NULL AND auth.uid() = user_id)
        OR (auth.uid() IS NULL AND guest_id IS NOT NULL)
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_themes' AND policyname = 'Users can update own themes') THEN
    CREATE POLICY "Users can update own themes"
      ON user_themes FOR UPDATE
      USING (
        (auth.uid() IS NOT NULL AND auth.uid() = user_id)
        OR (auth.uid() IS NULL AND guest_id IS NOT NULL)
      )
      WITH CHECK (
        (auth.uid() IS NOT NULL AND auth.uid() = user_id)
        OR (auth.uid() IS NULL AND guest_id IS NOT NULL)
      );
  END IF;
END $$;

-- Scripture Favorites Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scripture_favorites' AND policyname = 'Users can view own scripture favorites') THEN
    CREATE POLICY "Users can view own scripture favorites"
      ON scripture_favorites FOR SELECT
      USING (
        (auth.uid() IS NOT NULL AND auth.uid() = user_id)
        OR (auth.uid() IS NULL AND guest_id IS NOT NULL)
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scripture_favorites' AND policyname = 'Users can create scripture favorites') THEN
    CREATE POLICY "Users can create scripture favorites"
      ON scripture_favorites FOR INSERT
      WITH CHECK (
        (auth.uid() IS NOT NULL AND auth.uid() = user_id)
        OR (auth.uid() IS NULL AND guest_id IS NOT NULL)
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scripture_favorites' AND policyname = 'Users can update own scripture favorites') THEN
    CREATE POLICY "Users can update own scripture favorites"
      ON scripture_favorites FOR UPDATE
      USING (
        (auth.uid() IS NOT NULL AND auth.uid() = user_id)
        OR (auth.uid() IS NULL AND guest_id IS NOT NULL)
      )
      WITH CHECK (
        (auth.uid() IS NOT NULL AND auth.uid() = user_id)
        OR (auth.uid() IS NULL AND guest_id IS NOT NULL)
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scripture_favorites' AND policyname = 'Users can delete own scripture favorites') THEN
    CREATE POLICY "Users can delete own scripture favorites"
      ON scripture_favorites FOR DELETE
      USING (
        (auth.uid() IS NOT NULL AND auth.uid() = user_id)
        OR (auth.uid() IS NULL AND guest_id IS NOT NULL)
      );
  END IF;
END $$;

-- Prayer Reminders Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prayer_reminders' AND policyname = 'Users can view own reminders') THEN
    CREATE POLICY "Users can view own reminders"
      ON prayer_reminders FOR SELECT
      USING (
        (auth.uid() IS NOT NULL AND auth.uid() = user_id)
        OR (auth.uid() IS NULL AND guest_id IS NOT NULL)
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prayer_reminders' AND policyname = 'Users can create reminders') THEN
    CREATE POLICY "Users can create reminders"
      ON prayer_reminders FOR INSERT
      WITH CHECK (
        (auth.uid() IS NOT NULL AND auth.uid() = user_id)
        OR (auth.uid() IS NULL AND guest_id IS NOT NULL)
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prayer_reminders' AND policyname = 'Users can update own reminders') THEN
    CREATE POLICY "Users can update own reminders"
      ON prayer_reminders FOR UPDATE
      USING (
        (auth.uid() IS NOT NULL AND auth.uid() = user_id)
        OR (auth.uid() IS NULL AND guest_id IS NOT NULL)
      )
      WITH CHECK (
        (auth.uid() IS NOT NULL AND auth.uid() = user_id)
        OR (auth.uid() IS NULL AND guest_id IS NOT NULL)
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'prayer_reminders' AND policyname = 'Users can delete own reminders') THEN
    CREATE POLICY "Users can delete own reminders"
      ON prayer_reminders FOR DELETE
      USING (
        (auth.uid() IS NOT NULL AND auth.uid() = user_id)
        OR (auth.uid() IS NULL AND guest_id IS NOT NULL)
      );
  END IF;
END $$;

-- Insert sample guided prayer templates
INSERT INTO guided_prayer_templates (title, category, prompts, estimated_duration)
VALUES 
  (
    'Morning Gratitude',
    'Gratitude',
    '[
      "What am I grateful for today?",
      "Who in my life am I thankful for?",
      "What blessings have I received recently?",
      "How can I show gratitude today?"
    ]'::jsonb,
    5
  ),
  (
    'Peace & Comfort',
    'Peace',
    '[
      "What worries are weighing on my heart?",
      "Where do I need God''s peace?",
      "What comfort am I seeking?",
      "How can I release my anxieties?"
    ]'::jsonb,
    7
  ),
  (
    'Guidance & Direction',
    'Guidance',
    '[
      "What decision am I facing?",
      "Where do I need clarity?",
      "What is God calling me to do?",
      "How can I discern His will?"
    ]'::jsonb,
    10
  )
ON CONFLICT DO NOTHING;