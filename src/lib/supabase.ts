import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xidaoszvrdgttvgrntfe.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Helper to get current user's subscription ID
export const getUserSubscriptionId = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('user_profiles')
    .select('subscription_id')
    .eq('id', user.id)
    .single();

  return data?.subscription_id || null;
};

// Helper to check if user is primary account holder
export const isPrimaryAccount = async (): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('user_profiles')
    .select('is_primary_account')
    .eq('id', user.id)
    .single();

  return data?.is_primary_account || false;
};

// Helper to get co-parent profile
export const getCoParentProfile = async () => {
  const subscriptionId = await getUserSubscriptionId();
  if (!subscriptionId) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('subscription_id', subscriptionId)
    .neq('id', user.id)
    .single();

  return data;
};

