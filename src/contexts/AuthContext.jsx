import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isConfigured, setIsConfigured] = useState(false)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    // Check if Supabase is properly configured
    const configured = isSupabaseConfigured()
    setIsConfigured(configured)
    
    if (!configured) {
      console.error('Supabase not configured properly')
      setLoading(false)
      return
    }

    // Get initial session
    const initSession = async () => {
      try {
        console.log('Initializing auth session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          setAuthError(error.message)
          setUser(null)
        } else {
          console.log('Session state:', session ? 'Active' : 'None')
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error("Error getting session:", error)
        setAuthError(error.message)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initSession()

    // Listen for auth changes
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state change:', event)
          setUser(session?.user ?? null)
          setLoading(false)
        }
      )
      
      return () => {
        try {
          if (subscription && typeof subscription.unsubscribe === 'function') {
            subscription.unsubscribe()
          }
        } catch (error) {
          console.error("Error unsubscribing:", error)
        }
      }
    } catch (error) {
      console.error("Error setting up auth state change listener:", error)
      setAuthError(error.message)
      setLoading(false)
    }
  }, [])

  const signUp = async (email, password) => {
    if (!isConfigured) {
      return { error: { message: 'Supabase not configured' } }
    }
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      return { data, error }
    } catch (error) {
      console.error("Sign up error:", error)
      return { error: { message: error.message } }
    }
  }

  const signIn = async (email, password) => {
    if (!isConfigured) {
      return { error: { message: 'Supabase not configured' } }
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { data, error }
    } catch (error) {
      console.error("Sign in error:", error)
      return { error: { message: error.message } }
    }
  }

  const signOut = async () => {
    if (!isConfigured) {
      return { error: { message: 'Supabase not configured' } }
    }
    
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      console.error("Sign out error:", error)
      return { error: { message: error.message } }
    }
  }

  const value = {
    user,
    signUp,
    signIn,
    signOut,
    loading,
    isConfigured,
    authError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}