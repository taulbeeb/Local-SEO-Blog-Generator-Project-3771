import React, {createContext, useContext, useState, useEffect} from 'react'
import {supabase, isSupabaseConfigured} from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    // Check if Supabase is properly configured
    const configured = isSupabaseConfigured()
    setIsConfigured(configured)
    
    if (!configured) {
      setLoading(false)
      return
    }

    // Get initial session
    const initSession = async () => {
      try {
        const {data: {session}} = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } catch (error) {
        console.error("Error getting session:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    
    initSession()

    // Listen for auth changes
    try {
      const {data: {subscription}} = supabase.auth.onAuthStateChange(
        async (event, session) => {
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
      setLoading(false)
    }
  }, [])

  const signUp = async (email, password) => {
    if (!isConfigured) {
      return {error: {message: 'Supabase not configured'}}
    }
    
    const {data, error} = await supabase.auth.signUp({
      email,
      password,
    })
    return {data, error}
  }

  const signIn = async (email, password) => {
    if (!isConfigured) {
      return {error: {message: 'Supabase not configured'}}
    }
    
    const {data, error} = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return {data, error}
  }

  const signOut = async () => {
    if (!isConfigured) {
      return {error: {message: 'Supabase not configured'}}
    }
    
    const {error} = await supabase.auth.signOut()
    return {error}
  }

  const value = {
    user,
    signUp,
    signIn,
    signOut,
    loading,
    isConfigured
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}