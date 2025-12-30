import { useState, useEffect } from 'react'
import { supabase, isMockMode } from '@/lib/supabase'
import type { AuthState } from '@/types'

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    loading: true,
  })

  useEffect(() => {
    if (isMockMode) {
      // In mock mode, auto-login with a mock user
      setAuth({
        user: { id: 'mock-user-id', email: 'demo@gymbro.app' },
        loading: false,
      })
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuth({
        user: session?.user ? { id: session.user.id, email: session.user.email || '' } : null,
        loading: false,
      })
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuth({
        user: session?.user ? { id: session.user.id, email: session.user.email || '' } : null,
        loading: false,
      })
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (isMockMode) {
      setAuth({
        user: { id: 'mock-user-id', email },
        loading: false,
      })
      return { error: null }
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    if (isMockMode) {
      setAuth({
        user: { id: 'mock-user-id', email },
        loading: false,
      })
      return { error: null }
    }

    const { error } = await supabase.auth.signUp({ email, password })
    return { error }
  }

  const signOut = async () => {
    if (isMockMode) {
      setAuth({ user: null, loading: false })
      return
    }

    await supabase.auth.signOut()
  }

  const resetPassword = async (email: string) => {
    if (isMockMode) {
      return { error: null }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error }
  }

  const signInWithMagicLink = async (email: string) => {
    if (isMockMode) {
      setAuth({
        user: { id: 'mock-user-id', email },
        loading: false,
      })
      return { error: null }
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    })
    return { error }
  }

  return {
    user: auth.user,
    loading: auth.loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    signInWithMagicLink,
    isMockMode,
  }
}
