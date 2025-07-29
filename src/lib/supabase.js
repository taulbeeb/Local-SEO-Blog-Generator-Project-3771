import {createClient} from '@supabase/supabase-js'

// Use environment variables if available, otherwise fallback to hardcoded values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cevkjhdqjyaicgfazzdr.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNldmtqaGRxanlhaWNnZmF6emRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NjE5ODMsImV4cCI6MjA2OTMzNzk4M30.nK97lPYF-jKCFvO08L4WO6HNaobrmqMPRVBtRbA4glI'

// Export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

// Export a function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabaseUrl && supabaseAnonKey && 
         supabaseUrl !== 'https://<PROJECT-ID>.supabase.co' && 
         supabaseAnonKey !== '<ANON_KEY>'
}