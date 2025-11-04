import { createClient } from '@supabase/supabase-js'
import { Database } from './types/database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Auth helper functions
export const signUp = (email: string, password: string, metadata?: any) => {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  })
}

export const signIn = (email: string, password: string) => {
  return supabase.auth.signInWithPassword({
    email,
    password
  })
}

export const signInWithGoogle = () => {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
}

export const signOut = () => {
  return supabase.auth.signOut()
}

export const getCurrentUser = () => {
  return supabase.auth.getUser()
}

export const getCurrentSession = () => {
  return supabase.auth.getSession()
}