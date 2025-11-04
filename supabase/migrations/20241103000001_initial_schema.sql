-- Initial schema for CustodyX.AI multi-user SaaS

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE subscription_tier AS ENUM ('Free', 'Plus', 'Pro');
CREATE TYPE incident_category AS ENUM (
    'Communication Issue', 
    'Scheduling Conflict', 
    'Financial Dispute', 
    'Missed Visitation', 
    'Parental Alienation Concern', 
    'Child Wellbeing', 
    'Legal Documentation', 
    'Other'
);
CREATE TYPE document_folder AS ENUM (
    'Drafted Motions', 
    'Forensic Analyses', 
    'Evidence Packages', 
    'User Uploads'
);

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT CHECK (role IN ('Mother', 'Father', '')),
    children TEXT[] DEFAULT '{}',
    subscription_tier subscription_tier DEFAULT 'Free',
    stripe_customer_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Token usage tracking
CREATE TABLE public.token_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    used INTEGER DEFAULT 0 NOT NULL,
    reset_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Incident reports
CREATE TABLE public.reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    category incident_category NOT NULL,
    tags TEXT[] DEFAULT '{}',
    legal_context TEXT,
    images TEXT[] DEFAULT '{}', -- Array of base64 data URLs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Incident templates
CREATE TABLE public.incident_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category incident_category NOT NULL,
    tags TEXT[] DEFAULT '{}',
    legal_context TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents storage metadata
CREATE TABLE public.documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    folder document_folder NOT NULL,
    file_path TEXT, -- Path in Supabase Storage
    structured_data JSONB, -- For StructuredLegalDocument
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Co-parenting messages (future feature)
CREATE TABLE public.co_parent_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    sender_id TEXT NOT NULL, -- 'user' or 'other_parent'
    co_parent_email TEXT, -- Email of the other parent for future messaging
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription management
CREATE TABLE public.subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    stripe_subscription_id TEXT UNIQUE,
    status TEXT NOT NULL, -- active, inactive, cancelled, past_due
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log for tracking user actions
CREATE TABLE public.audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_reports_user_id ON public.reports(user_id);
CREATE INDEX idx_reports_created_at ON public.reports(created_at DESC);
CREATE INDEX idx_reports_category ON public.reports(category);

CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_documents_folder ON public.documents(folder);

CREATE INDEX idx_incident_templates_user_id ON public.incident_templates(user_id);

CREATE INDEX idx_token_usage_user_id ON public.token_usage(user_id);

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.co_parent_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles: Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Token usage: Users can only see their own token usage
CREATE POLICY "Users can view own token usage" ON public.token_usage
    FOR ALL USING (auth.uid() = user_id);

-- Reports: Users can only access their own reports
CREATE POLICY "Users can view own reports" ON public.reports
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports" ON public.reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports" ON public.reports
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports" ON public.reports
    FOR DELETE USING (auth.uid() = user_id);

-- Templates: Users can only access their own templates
CREATE POLICY "Users can view own templates" ON public.incident_templates
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own templates" ON public.incident_templates
    FOR ALL USING (auth.uid() = user_id);

-- Documents: Users can only access their own documents
CREATE POLICY "Users can view own documents" ON public.documents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own documents" ON public.documents
    FOR ALL USING (auth.uid() = user_id);

-- Messages: Users can only access their own messages
CREATE POLICY "Users can view own messages" ON public.co_parent_messages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own messages" ON public.co_parent_messages
    FOR ALL USING (auth.uid() = user_id);

-- Subscriptions: Users can only view their own subscription
CREATE POLICY "Users can view own subscription" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Audit logs: Users can only view their own audit logs
CREATE POLICY "Users can view own audit logs" ON public.audit_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Functions
-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, children)
  VALUES (
    new.id, 
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', ''),
    COALESCE(
      ARRAY(SELECT jsonb_array_elements_text(new.raw_user_meta_data->'children')), 
      '{}'::text[]
    )
  );
  
  -- Create initial token usage record
  INSERT INTO public.token_usage (user_id, used, reset_date)
  VALUES (
    new.id, 
    0, 
    (NOW() + INTERVAL '1 month')::timestamp with time zone
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_token_usage_updated_at BEFORE UPDATE ON public.token_usage
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_incident_templates_updated_at BEFORE UPDATE ON public.incident_templates
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_co_parent_messages_updated_at BEFORE UPDATE ON public.co_parent_messages
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();