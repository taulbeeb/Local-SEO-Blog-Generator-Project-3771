import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cevkjhdqjyaicgfazzdr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNldmtqaGRxanlhaWNnZmF6emRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NjE5ODMsImV4cCI6MjA2OTMzNzk4M30.nK97lPYF-jKCFvO08L4WO6HNaobrmqMPRVBtRbA4glI'

// Export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

// Export a function to check if Supabase is properly configured
export const isSupabaseConfigured = () => true