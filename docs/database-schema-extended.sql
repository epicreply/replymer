-- ============================================================================
-- REPLYMER - Extended Database Schema
-- ============================================================================
-- AI-powered social media lead generation platform
-- Monitors Reddit, Twitter, LinkedIn for high-intent conversations
-- Generates contextual engagement suggestions
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM ('owner', 'admin', 'guest');
CREATE TYPE team_member_status AS ENUM ('invited', 'accepted', 'rejected');
CREATE TYPE notification_type AS ENUM ('welcome', 'news', 'updates', 'invite_accepted', 'lead_found', 'quota_warning', 'quota_exceeded');
CREATE TYPE social_platform AS ENUM ('reddit', 'twitter', 'linkedin');
CREATE TYPE lead_status AS ENUM ('unread', 'completed', 'discarded');
CREATE TYPE subscription_plan AS ENUM ('starter', 'pro', 'enterprise', 'free_trial');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'canceled', 'unpaid', 'trialing');
CREATE TYPE billing_transaction_status AS ENUM ('pending', 'succeeded', 'failed', 'refunded');

-- ============================================================================
-- CORE TABLES (Existing)
-- ============================================================================

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT,
  avatar_url TEXT,
  theme_preference TEXT DEFAULT 'system' CHECK (theme_preference IN ('light', 'dark', 'system')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Projects table (represents brands/products in the UI)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  website_url TEXT,
  description TEXT,
  target_audience TEXT,
  value_proposition TEXT,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Team members table
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'admin',
  status team_member_status NOT NULL DEFAULT 'accepted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  joined_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE (project_id, user_id)
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  type notification_type NOT NULL DEFAULT 'welcome',
  details JSONB,
  cta TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE deleted_at IS NULL;

-- Magic tokens for authentication
CREATE TABLE magic_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_magic_tokens_token ON magic_tokens(token) WHERE used_at IS NULL;
CREATE INDEX idx_magic_tokens_expires ON magic_tokens(expires_at) WHERE used_at IS NULL;

-- ============================================================================
-- EXTENDED TABLES (New for Replymer)
-- ============================================================================

-- Communities to monitor (subreddits, hashtags, LinkedIn groups)
CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  platform social_platform NOT NULL,
  name TEXT NOT NULL,
  display_name TEXT,
  platform_id TEXT, -- External ID from the platform (e.g., subreddit ID)
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  lead_count INTEGER NOT NULL DEFAULT 0,
  last_checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE (project_id, platform, name)
);

CREATE INDEX idx_communities_project ON communities(project_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_communities_active ON communities(project_id, is_active) WHERE deleted_at IS NULL;

-- Keywords for search monitoring
CREATE TABLE keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  match_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE (project_id, keyword)
);

CREATE INDEX idx_keywords_project ON keywords(project_id) WHERE deleted_at IS NULL;

-- Leads (social media posts identified as potential opportunities)
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  community_id UUID REFERENCES communities(id) ON DELETE SET NULL,
  platform social_platform NOT NULL,
  platform_post_id TEXT NOT NULL, -- Unique ID from the platform
  platform_url TEXT NOT NULL,

  -- Post content
  title TEXT,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_handle TEXT NOT NULL,
  author_url TEXT,

  -- Relevancy and classification
  relevancy_score INTEGER NOT NULL CHECK (relevancy_score >= 0 AND relevancy_score <= 100),
  matched_keywords TEXT[], -- Array of keywords that matched
  status lead_status NOT NULL DEFAULT 'unread',

  -- AI-generated suggestions
  suggested_comment TEXT,
  suggested_dm TEXT,

  -- User actions
  user_reply TEXT,
  replied_at TIMESTAMPTZ,
  replied_by UUID REFERENCES users(id) ON DELETE SET NULL,
  discarded_at TIMESTAMPTZ,
  discarded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  discard_reason TEXT,

  -- Engagement tracking
  comment_sent BOOLEAN NOT NULL DEFAULT FALSE,
  comment_sent_at TIMESTAMPTZ,
  dm_sent BOOLEAN NOT NULL DEFAULT FALSE,
  dm_sent_at TIMESTAMPTZ,

  -- Post metadata
  post_created_at TIMESTAMPTZ NOT NULL,
  post_upvotes INTEGER DEFAULT 0,
  post_comments INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id) ON DELETE SET NULL,

  UNIQUE (project_id, platform, platform_post_id)
);

CREATE INDEX idx_leads_project_status ON leads(project_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_project_platform ON leads(project_id, platform) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_relevancy ON leads(project_id, relevancy_score DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_created ON leads(project_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_community ON leads(community_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_platform_post ON leads(platform, platform_post_id);

-- Full-text search index for leads
CREATE INDEX idx_leads_search ON leads USING gin(
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '') || ' ' || coalesce(author_name, ''))
);

-- AI Prompt settings per project
CREATE TABLE prompt_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Search prompt (criteria for finding relevant posts)
  search_prompt TEXT NOT NULL,

  -- Comment prompt (template for public replies)
  comment_prompt TEXT NOT NULL,

  -- DM prompt (template for direct messages)
  dm_prompt TEXT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,

  UNIQUE (project_id)
);

-- Subscription plans and billing
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  plan subscription_plan NOT NULL DEFAULT 'free_trial',
  status subscription_status NOT NULL DEFAULT 'trialing',

  -- Stripe integration
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,

  -- Billing period
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  trial_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,

  -- Pricing
  amount_cents INTEGER,
  currency TEXT DEFAULT 'usd',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (project_id)
);

CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Usage tracking (replies, DMs sent per billing period)
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,

  -- Period
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  -- Usage limits based on plan
  replies_limit INTEGER NOT NULL,
  dms_limit INTEGER,

  -- Current usage
  replies_used INTEGER NOT NULL DEFAULT 0,
  dms_used INTEGER NOT NULL DEFAULT 0,

  -- Overage
  replies_overage INTEGER NOT NULL DEFAULT 0,
  dms_overage INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (project_id, period_start)
);

CREATE INDEX idx_usage_project_period ON usage_tracking(project_id, period_start DESC);

-- Billing transaction history
CREATE TABLE billing_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Stripe integration
  stripe_invoice_id TEXT,
  stripe_payment_intent_id TEXT,

  -- Transaction details
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  description TEXT NOT NULL,
  status billing_transaction_status NOT NULL DEFAULT 'pending',

  -- Dates
  invoice_date TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,

  -- Invoice URL
  invoice_url TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_billing_subscription ON billing_transactions(subscription_id, invoice_date DESC);
CREATE INDEX idx_billing_project ON billing_transactions(project_id, invoice_date DESC);
CREATE INDEX idx_billing_stripe_invoice ON billing_transactions(stripe_invoice_id);

-- Analytics aggregated data (for performance)
CREATE TABLE analytics_daily (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Lead metrics
  leads_discovered INTEGER NOT NULL DEFAULT 0,
  leads_unread INTEGER NOT NULL DEFAULT 0,
  leads_completed INTEGER NOT NULL DEFAULT 0,
  leads_discarded INTEGER NOT NULL DEFAULT 0,

  -- Engagement metrics
  comments_sent INTEGER NOT NULL DEFAULT 0,
  dms_sent INTEGER NOT NULL DEFAULT 0,

  -- Platform breakdown
  reddit_leads INTEGER NOT NULL DEFAULT 0,
  twitter_leads INTEGER NOT NULL DEFAULT 0,
  linkedin_leads INTEGER NOT NULL DEFAULT 0,

  -- Relevancy metrics
  avg_relevancy_score DECIMAL(5,2),
  high_relevancy_leads INTEGER NOT NULL DEFAULT 0, -- Score >= 80

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (project_id, date)
);

CREATE INDEX idx_analytics_project_date ON analytics_daily(project_id, date DESC);

-- Community performance metrics
CREATE TABLE community_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  leads_discovered INTEGER NOT NULL DEFAULT 0,
  leads_completed INTEGER NOT NULL DEFAULT 0,
  avg_relevancy_score DECIMAL(5,2),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (community_id, date)
);

CREATE INDEX idx_community_analytics_project ON community_analytics(project_id, date DESC);
CREATE INDEX idx_community_analytics_community ON community_analytics(community_id, date DESC);

-- Platform credentials (for API access to Reddit, Twitter, LinkedIn)
CREATE TABLE platform_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  platform social_platform NOT NULL,

  -- Encrypted credentials (use pgcrypto or application-level encryption)
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,

  -- OAuth metadata
  oauth_state TEXT,
  scope TEXT,

  -- Status
  is_connected BOOLEAN NOT NULL DEFAULT FALSE,
  last_used_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (project_id, platform)
);

CREATE INDEX idx_platform_credentials_project ON platform_credentials(project_id);

-- Background job tracking
CREATE TABLE background_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL, -- 'monitor_communities', 'score_leads', 'generate_responses', etc.
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),

  -- Job metadata
  payload JSONB,
  result JSONB,
  error_message TEXT,

  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_jobs_status ON background_jobs(status, created_at DESC);
CREATE INDEX idx_jobs_project ON background_jobs(project_id, created_at DESC);

-- ============================================================================
-- DEFAULT DATA SEEDS
-- ============================================================================

-- Default prompt templates
CREATE OR REPLACE FUNCTION create_default_prompts()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO prompt_settings (project_id, search_prompt, comment_prompt, dm_prompt)
  VALUES (
    NEW.id,
    -- Default search prompt
    'Find conversations where people are:
1. Asking questions about [product category]
2. Discussing problems related to [pain point]
3. Searching for alternatives to [competitor]
4. Expressing frustration with current solutions
5. Requesting recommendations for [use case]

Focus on genuine questions and discussions where <product_name> could provide real value.',

    -- Default comment prompt
    'Hey [author_name], I saw your post about [topic] and wanted to share some thoughts.

[Acknowledge their specific problem or question]

[Share a genuine insight or personal experience related to the topic]

[If relevant, mention how you''ve dealt with similar challenges, but don''t directly pitch]

Happy to share more details if helpful!',

    -- Default DM prompt
    'Hi [author_name],

I came across your post on [community] about [topic] and thought I''d reach out.

[Acknowledge their specific pain point or question]

[Mention your relevant experience or how you''ve helped others with similar challenges]

[Offer specific value - a resource, advice, or insight]

[Low-commitment next step, like "happy to chat if you''re interested"]

Best,
[Your name]'
  )
  ON CONFLICT (project_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_default_prompts
AFTER INSERT ON projects
FOR EACH ROW
EXECUTE FUNCTION create_default_prompts();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to calculate reply rate for analytics
CREATE OR REPLACE FUNCTION calculate_reply_rate(project_uuid UUID, start_date TIMESTAMPTZ, end_date TIMESTAMPTZ)
RETURNS DECIMAL AS $$
DECLARE
  total_leads INTEGER;
  completed_leads INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_leads
  FROM leads
  WHERE project_id = project_uuid
    AND created_at >= start_date
    AND created_at < end_date
    AND deleted_at IS NULL;

  SELECT COUNT(*) INTO completed_leads
  FROM leads
  WHERE project_id = project_uuid
    AND created_at >= start_date
    AND created_at < end_date
    AND status = 'completed'
    AND deleted_at IS NULL;

  IF total_leads = 0 THEN
    RETURN 0;
  END IF;

  RETURN ROUND((completed_leads::DECIMAL / total_leads::DECIMAL) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to increment usage tracking
CREATE OR REPLACE FUNCTION increment_usage(
  project_uuid UUID,
  usage_type TEXT -- 'reply' or 'dm'
)
RETURNS BOOLEAN AS $$
DECLARE
  current_usage RECORD;
  period_start TIMESTAMPTZ;
  period_end TIMESTAMPTZ;
BEGIN
  -- Get current billing period
  SELECT s.current_period_start, s.current_period_end
  INTO period_start, period_end
  FROM subscriptions s
  WHERE s.project_id = project_uuid
    AND s.status = 'active'
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No active subscription found for project';
  END IF;

  -- Get or create usage record for current period
  SELECT * INTO current_usage
  FROM usage_tracking
  WHERE project_id = project_uuid
    AND period_start = period_start
  FOR UPDATE;

  IF NOT FOUND THEN
    -- Create usage record
    INSERT INTO usage_tracking (project_id, period_start, period_end, replies_limit, dms_limit)
    SELECT project_uuid, period_start, period_end,
      CASE s.plan
        WHEN 'starter' THEN 50
        WHEN 'pro' THEN 200
        WHEN 'enterprise' THEN 999999
        ELSE 10
      END,
      CASE s.plan
        WHEN 'starter' THEN 25
        WHEN 'pro' THEN 100
        WHEN 'enterprise' THEN 999999
        ELSE 5
      END
    FROM subscriptions s
    WHERE s.project_id = project_uuid
      AND s.status = 'active';

    current_usage := NULL;
  END IF;

  -- Increment usage
  IF usage_type = 'reply' THEN
    UPDATE usage_tracking
    SET replies_used = replies_used + 1,
        updated_at = NOW()
    WHERE project_id = project_uuid
      AND period_start = period_start;
  ELSIF usage_type = 'dm' THEN
    UPDATE usage_tracking
    SET dms_used = dms_used + 1,
        updated_at = NOW()
    WHERE project_id = project_uuid
      AND period_start = period_start;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to check if usage limit is exceeded
CREATE OR REPLACE FUNCTION check_usage_limit(
  project_uuid UUID,
  usage_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  current_usage RECORD;
BEGIN
  SELECT *
  INTO current_usage
  FROM usage_tracking ut
  JOIN subscriptions s ON s.project_id = ut.project_id
  WHERE ut.project_id = project_uuid
    AND ut.period_start <= NOW()
    AND ut.period_end > NOW()
    AND s.status = 'active'
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN FALSE; -- No active subscription or usage tracking
  END IF;

  IF usage_type = 'reply' THEN
    RETURN current_usage.replies_used < current_usage.replies_limit;
  ELSIF usage_type = 'dm' THEN
    RETURN current_usage.dms_used < current_usage.dms_limit;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Active leads summary view
CREATE OR REPLACE VIEW v_leads_summary AS
SELECT
  l.project_id,
  l.platform,
  l.status,
  COUNT(*) as lead_count,
  AVG(l.relevancy_score) as avg_relevancy_score,
  COUNT(CASE WHEN l.relevancy_score >= 80 THEN 1 END) as high_relevancy_count
FROM leads l
WHERE l.deleted_at IS NULL
GROUP BY l.project_id, l.platform, l.status;

-- Project usage summary view
CREATE OR REPLACE VIEW v_project_usage AS
SELECT
  p.id as project_id,
  p.name as project_name,
  s.plan,
  s.status as subscription_status,
  ut.replies_used,
  ut.replies_limit,
  ut.dms_used,
  ut.dms_limit,
  ROUND((ut.replies_used::DECIMAL / NULLIF(ut.replies_limit, 0)::DECIMAL) * 100, 2) as replies_usage_percent,
  ut.period_start,
  ut.period_end
FROM projects p
LEFT JOIN subscriptions s ON s.project_id = p.id
LEFT JOIN usage_tracking ut ON ut.project_id = p.id
  AND ut.period_start <= NOW()
  AND ut.period_end > NOW()
WHERE p.deleted_at IS NULL;

-- Community performance view
CREATE OR REPLACE VIEW v_community_performance AS
SELECT
  c.id as community_id,
  c.project_id,
  c.name as community_name,
  c.platform,
  c.lead_count,
  COUNT(l.id) as total_leads,
  COUNT(CASE WHEN l.status = 'completed' THEN 1 END) as completed_leads,
  AVG(l.relevancy_score) as avg_relevancy_score,
  MAX(l.created_at) as last_lead_at
FROM communities c
LEFT JOIN leads l ON l.community_id = c.id AND l.deleted_at IS NULL
WHERE c.deleted_at IS NULL
  AND c.is_active = TRUE
GROUP BY c.id, c.project_id, c.name, c.platform, c.lead_count;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE leads IS 'Social media posts identified as potential engagement opportunities';
COMMENT ON TABLE communities IS 'Social media communities to monitor (subreddits, hashtags, LinkedIn groups)';
COMMENT ON TABLE prompt_settings IS 'AI prompt templates for search, comment, and DM generation';
COMMENT ON TABLE subscriptions IS 'Subscription plans and billing information';
COMMENT ON TABLE usage_tracking IS 'Track usage of replies and DMs per billing period';
COMMENT ON TABLE analytics_daily IS 'Daily aggregated analytics for performance';
COMMENT ON TABLE platform_credentials IS 'Encrypted OAuth credentials for social platforms';
