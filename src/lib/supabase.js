import { createClient } from '@supabase/supabase-js'

// For development and production environments
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cevkjhdqjyaicgfazzdr.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNldmtqaGRxanlhaWNnZmF6emRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NjE5ODMsImV4cCI6MjA2OTMzNzk4M30.nK97lPYF-jKCFvO08L4WO6HNaobrmqMPRVBtRbA4glI'

// Log connection status for debugging
console.log('Supabase connection status:', {
  urlConfigured: !!supabaseUrl && supabaseUrl !== 'https://<PROJECT-ID>.supabase.co',
  keyConfigured: !!supabaseAnonKey && supabaseAnonKey !== '<ANON_KEY>'
})

// Create client with error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: globalThis.localStorage
  }
})

// Export a function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabaseUrl && 
         supabaseAnonKey && 
         supabaseUrl !== 'https://<PROJECT-ID>.supabase.co' && 
         supabaseAnonKey !== '<ANON_KEY>'
}