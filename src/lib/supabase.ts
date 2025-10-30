import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = 'https://xidaoszvrdgttvgrntfe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpZGFvc3p2cmRndHR2Z3JudGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MDYxODAsImV4cCI6MjA3NzI4MjE4MH0.Fr-ju7Mugeit46mQ7WSywFJHs7jbGSABSUC4SfVMLvM';

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
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('subscription_id')
      .eq('id', user.id)
      .single();

    if (error) {
      // Table might not exist yet - that's okay
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.warn('user_profiles table not found. Run migrations first.');
        return null;
      }
      // PGRST116 means no rows returned - user hasn't created profile yet
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data?.subscription_id || null;
  } catch (error) {
    console.error('Error getting subscription ID:', error);
    return null;
  }
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

