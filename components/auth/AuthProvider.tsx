import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { profileApi } from '../../lib/api'
import { UserProfile } from '../../types'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  updateProfile: (profile: UserProfile) => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession()
      setSession(initialSession)
      setUser(initialSession?.user ?? null)
      
      if (initialSession?.user) {
        await loadProfile()
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        setSession(session)
        setUser(session?.user ?? null)

        if (event === 'SIGNED_IN' && session?.user) {
          await loadProfile()
          toast.success('Successfully signed in!')
        } else if (event === 'SIGNED_OUT') {
          setProfile(null)
          toast.success('Successfully signed out!')
        } else if (event === 'TOKEN_REFRESHED') {
          // Silently handle token refresh
          console.log('Token refreshed')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async () => {
    try {
      const userProfile = await profileApi.get()
      setProfile(userProfile)
    } catch (error) {
      console.error('Failed to load profile:', error)
      toast.error('Failed to load profile')
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Failed to sign out')
    }
  }

  const updateProfile = async (newProfile: UserProfile) => {
    try {
      await profileApi.update(newProfile)
      setProfile(newProfile)
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('Failed to update profile')
      throw error
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await loadProfile()
    }
  }

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signOut,
    updateProfile,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// HOC for protected routes
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => {
    const { user, loading } = useAuth()

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    if (!user) {
      return <AuthComponent />
    }

    return <Component {...props} />
  }
}

// Import AuthComponent (we'll need to adjust this import)
const AuthComponent = React.lazy(() => import('./AuthComponent'))