-- ============================================
-- 1. PORTFOLIO PROJECTS TABLE
-- ============================================
CREATE TABLE portfolio_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  live_url text,
  github_url text,
  tech text[] DEFAULT '{}',
  sort_order integer DEFAULT 0,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for public queries (published + sort order)
CREATE INDEX idx_portfolio_projects_published ON portfolio_projects (is_published, sort_order);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON portfolio_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. ADMIN USERS TABLE
-- ============================================
CREATE TABLE admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 3. ROW LEVEL SECURITY — portfolio_projects
-- ============================================
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;

-- Public: SELECT published only
CREATE POLICY "Public can view published projects"
  ON portfolio_projects FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

-- Admin: full SELECT (including unpublished)
CREATE POLICY "Admins can view all projects"
  ON portfolio_projects FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- Admin: INSERT
CREATE POLICY "Admins can insert projects"
  ON portfolio_projects FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- Admin: UPDATE
CREATE POLICY "Admins can update projects"
  ON portfolio_projects FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- Admin: DELETE
CREATE POLICY "Admins can delete projects"
  ON portfolio_projects FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- ============================================
-- 4. ROW LEVEL SECURITY — admin_users
-- ============================================
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Admin can read own record (for auth check)
CREATE POLICY "Users can check own admin status"
  ON admin_users FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- 5. SEED DATA — Migrate existing projects
-- ============================================
INSERT INTO portfolio_projects (title, description, image_url, live_url, github_url, tech, sort_order, is_published)
VALUES
  (
    'Website Portfolio',
    'My personal website, I created this website to display my profile, skills and projects. As well as my place to try new technology.',
    '/images/WebPort.webp',
    'https://ktp-jade.vercel.app/',
    'https://github.com/kktpx/Web-Portfolio',
    ARRAY['React', 'Vite', 'CSS', 'JavaScript'],
    1,
    true
  ),
  (
    'Web-IDS',
    'Developed a web-based Intrusion Detection System (IDS) using Python and machine learning to detect and analyze potentially malicious web requests. The project includes log generation, payload analysis, model training, and a web interface for monitoring security events.',
    '/images/Web-IDS.webp',
    'https://project-web-ids.onrender.com/',
    'https://github.com/kktpx/Project_web-ids',
    ARRAY['Python', 'Flask', 'Machine Learning', 'HTML/CSS'],
    2,
    true
  ),
  (
    'Calcu',
    'A simple and intuitive calorie calculator for estimating daily calorie needs and fitness goals.',
    '/images/calcu.webp',
    'https://calcu-liard.vercel.app/',
    'https://github.com/kktpx/Calcu',
    ARRAY['React', 'Vite', 'CSS', 'JavaScript'],
    3,
    true
  ),
  (
    '20 Shop',
    'A mini-project developed for a university course. This web application simulates a football jersey store to demonstrate web development fundamentals.',
    '/images/20Shop.webp',
    'https://20shop.vercel.app/',
    'https://github.com/kktpx/20-shop',
    ARRAY['React', 'Next.js', 'CSS', 'JavaScript'],
    4,
    true
  );

-- ============================================
-- 6. INSERT FIRST ADMIN (run after creating auth user)
-- ============================================
-- After creating a user in Supabase Auth Dashboard:
-- INSERT INTO admin_users (user_id) VALUES ('YOUR_AUTH_USER_UUID_HERE');
