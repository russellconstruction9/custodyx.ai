-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  plan_type TEXT NOT NULL DEFAULT 'free', -- 'free', 'plus', 'pro'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'past_due'
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('Mother', 'Father', '')),
  children TEXT[], -- Array of children names
  email TEXT NOT NULL,
  is_primary_account BOOLEAN DEFAULT false, -- The one who created the subscription
  invited_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_user_profiles_subscription ON user_profiles(subscription_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);

-- Reports table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  legal_context TEXT,
  images TEXT[] NOT NULL DEFAULT '{}', -- Base64 data URLs
  incident_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reports_subscription ON reports(subscription_id);
CREATE INDEX idx_reports_incident_date ON reports(incident_date DESC);
CREATE INDEX idx_reports_category ON reports(category);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  data TEXT NOT NULL, -- Base64 encoded
  folder TEXT NOT NULL,
  structured_data JSONB, -- For structured legal documents
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_subscription ON documents(subscription_id);
CREATE INDEX idx_documents_folder ON documents(folder);

-- Incident templates table
CREATE TABLE incident_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  legal_context TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_templates_subscription ON incident_templates(subscription_id);

-- Messages table (for co-parent messaging)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_subscription ON messages(subscription_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON incident_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

