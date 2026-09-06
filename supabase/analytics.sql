-- ============================================
-- PORTFOLIO ANALYTICS TABLE
-- ============================================
CREATE TABLE portfolio_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  project_id UUID REFERENCES portfolio_projects(id) ON DELETE SET NULL,
  page_path TEXT,
  referrer TEXT,
  device_type TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Only allow known event types
  CONSTRAINT valid_event_type CHECK (
    event_type IN (
      'page_view', 'project_view', 'github_click',
      'demo_click', 'resume_download', 'contact_submit'
    )
  ),

  -- Only allow known device types
  CONSTRAINT valid_device_type CHECK (
    device_type IS NULL OR device_type IN ('desktop', 'tablet', 'mobile', 'unknown')
  )
);

-- ============================================
-- INDEXES
-- ============================================
-- Fast date-range analytics
CREATE INDEX idx_analytics_created_at ON portfolio_analytics(created_at DESC);
-- Fast event aggregation
CREATE INDEX idx_analytics_event_type ON portfolio_analytics(event_type);
-- Top project analytics
CREATE INDEX idx_analytics_project_id ON portfolio_analytics(project_id);
-- Unique visitor calculations
CREATE INDEX idx_analytics_session_id ON portfolio_analytics(session_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE portfolio_analytics ENABLE ROW LEVEL SECURITY;

-- Public/Anonymous: INSERT only (for tracking)
CREATE POLICY "Anyone can insert analytics events"
  ON portfolio_analytics FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admin: SELECT (for dashboard)
CREATE POLICY "Admins can view analytics"
  ON portfolio_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- Admin: DELETE (for cleanup of old data)
CREATE POLICY "Admins can delete analytics"
  ON portfolio_analytics FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );
