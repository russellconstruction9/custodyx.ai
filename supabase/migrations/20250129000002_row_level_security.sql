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

-- Subscriptions policies (users can only see their own subscription)
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

-- Reports policies (shared between co-parents)
CREATE POLICY "Users can view reports in their subscription"
  ON reports FOR SELECT
  USING (subscription_id = auth.user_subscription_id());

CREATE POLICY "Users can create reports in their subscription"
  ON reports FOR INSERT
  WITH CHECK (
    subscription_id = auth.user_subscription_id() 
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update their own reports"
  ON reports FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own reports"
  ON reports FOR DELETE
  USING (created_by = auth.uid());

-- Documents policies (shared between co-parents)
CREATE POLICY "Users can view documents in their subscription"
  ON documents FOR SELECT
  USING (subscription_id = auth.user_subscription_id());

CREATE POLICY "Users can create documents in their subscription"
  ON documents FOR INSERT
  WITH CHECK (
    subscription_id = auth.user_subscription_id() 
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update their own documents"
  ON documents FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own documents"
  ON documents FOR DELETE
  USING (created_by = auth.uid());

-- Incident templates policies (shared between co-parents)
CREATE POLICY "Users can view templates in their subscription"
  ON incident_templates FOR SELECT
  USING (subscription_id = auth.user_subscription_id());

CREATE POLICY "Users can create templates in their subscription"
  ON incident_templates FOR INSERT
  WITH CHECK (
    subscription_id = auth.user_subscription_id() 
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update their own templates"
  ON incident_templates FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own templates"
  ON incident_templates FOR DELETE
  USING (created_by = auth.uid());

-- Messages policies (shared between co-parents)
CREATE POLICY "Users can view messages in their subscription"
  ON messages FOR SELECT
  USING (subscription_id = auth.user_subscription_id());

CREATE POLICY "Users can create messages in their subscription"
  ON messages FOR INSERT
  WITH CHECK (
    subscription_id = auth.user_subscription_id() 
    AND sender_id = auth.uid()
  );

