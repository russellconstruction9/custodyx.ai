# 🚀 Supabase Setup - Copy & Paste Instructions

Your app is ready! Just need to run 2 SQL scripts in Supabase Dashboard.

## Step 1: Open Supabase SQL Editor

Click this link: **[Open Supabase SQL Editor](https://supabase.com/dashboard/project/xidaoszvrdgttvgrntfe/sql/new)**

## Step 2: Run First Migration (Create Tables)

1. In the SQL Editor, paste this entire script:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  plan_type TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
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
  children TEXT[],
  email TEXT NOT NULL,
  is_primary_account BOOLEAN DEFAULT false,
  invited_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
  images TEXT[] NOT NULL DEFAULT '{}',
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
  data TEXT NOT NULL,
  folder TEXT NOT NULL,
  structured_data JSONB,
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

-- Messages table
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
```

2. Click the **"Run"** button (bottom right)
3. You should see "Success. No rows returned"

## Step 3: Run Second Migration (Security Policies)

1. In the same SQL Editor, **clear the text** and paste this:

```sql
-- Enable Row Level Security on all tables
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's subscription_id
CREATE OR REPLACE FUNCTION auth.user_subscription_id()
RETURNS UUID AS $$
  SELECT subscription_id FROM user_profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- Subscriptions policies
CREATE POLICY "Users can view their own subscription"
  ON subscriptions FOR SELECT
  USING (id IN (SELECT subscription_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their own subscription"
  ON subscriptions FOR UPDATE
  USING (id IN (SELECT subscription_id FROM user_profiles WHERE id = auth.uid() AND is_primary_account = true));

-- User profiles policies
CREATE POLICY "Users can view profiles in their subscription"
  ON user_profiles FOR SELECT
  USING (subscription_id = auth.user_subscription_id() OR id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- Reports policies
CREATE POLICY "Users can view reports in their subscription"
  ON reports FOR SELECT
  USING (subscription_id = auth.user_subscription_id());

CREATE POLICY "Users can create reports in their subscription"
  ON reports FOR INSERT
  WITH CHECK (subscription_id = auth.user_subscription_id() AND created_by = auth.uid());

CREATE POLICY "Users can update their own reports"
  ON reports FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own reports"
  ON reports FOR DELETE
  USING (created_by = auth.uid());

-- Documents policies
CREATE POLICY "Users can view documents in their subscription"
  ON documents FOR SELECT
  USING (subscription_id = auth.user_subscription_id());

CREATE POLICY "Users can create documents in their subscription"
  ON documents FOR INSERT
  WITH CHECK (subscription_id = auth.user_subscription_id() AND created_by = auth.uid());

CREATE POLICY "Users can update their own documents"
  ON documents FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own documents"
  ON documents FOR DELETE
  USING (created_by = auth.uid());

-- Templates policies
CREATE POLICY "Users can view templates in their subscription"
  ON incident_templates FOR SELECT
  USING (subscription_id = auth.user_subscription_id());

CREATE POLICY "Users can create templates in their subscription"
  ON incident_templates FOR INSERT
  WITH CHECK (subscription_id = auth.user_subscription_id() AND created_by = auth.uid());

CREATE POLICY "Users can update their own templates"
  ON incident_templates FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own templates"
  ON incident_templates FOR DELETE
  USING (created_by = auth.uid());

-- Messages policies
CREATE POLICY "Users can view messages in their subscription"
  ON messages FOR SELECT
  USING (subscription_id = auth.user_subscription_id());

CREATE POLICY "Users can create messages in their subscription"
  ON messages FOR INSERT
  WITH CHECK (subscription_id = auth.user_subscription_id() AND sender_id = auth.uid());
```

2. Click **"Run"** again
3. You should see "Success. No rows returned"

## Step 4: Enable Realtime for Messages

1. Go to **[Database Replication](https://supabase.com/dashboard/project/xidaoszvrdgttvgrntfe/database/publications)**
2. Find the `supabase_realtime` publication
3. Check the box next to the **`messages`** table
4. Click **Save**

## ✅ Done!

Your app is now fully set up! Go to **http://localhost:3001** and try:

1. Sign up with email/password
2. Complete your profile
3. Start logging incidents!

Everything will now save to Supabase and sync in real-time! 🎉

---

## Optional: Deploy Edge Functions (For Production)

The app currently works with direct Gemini API calls. To secure the API key for production, run:

```bash
npm install supabase --save-dev
npx supabase login
npx supabase link --project-ref xidaoszvrdgttvgrntfe
npx supabase secrets set GEMINI_API_KEY=AIzaSyCvMT78j9HFFiM9xJ08p9A-kkLerZoCY8k
npx supabase functions deploy gemini-chat
npx supabase functions deploy gemini-generate-report
npx supabase functions deploy gemini-legal-assistant
npx supabase functions deploy gemini-analyze-incident
```

But this is optional - the app works fine without it for testing!

