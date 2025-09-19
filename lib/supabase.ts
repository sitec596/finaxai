import { createClient } from '@supabase/supabase-js'

// Get these from your Supabase project: Settings -> API
const supabaseUrl = 'https://ksfsyfgszehmhljysfga.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzZnN5ZmdzemVobWhsanlzZmdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyOTY3ODUsImV4cCI6MjA3Mzg3Mjc4NX0.a2vTNYq4tk7RN7fXoCE9hZPMfdGyz92v-egJA01p348'

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)