// services/supabaseClient.ts
// Initialize Supabase client for the app using Vite environment variables.
// Required env vars (set in .env.local or your deployment environment):
//   VITE_SUPABASE_URL
//   VITE_SUPABASE_ANON_KEY

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn('Supabase env vars are not set. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local or environment.');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
