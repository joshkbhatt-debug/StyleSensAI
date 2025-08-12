import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types
export interface Profile {
  user_id: string
  purpose: string
  goal: string
  length: string
  onboarding_complete: boolean
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan: 'free' | 'plus' | 'pro'
  status: string
  current_period_end: string | null
  created_at: string
}

export interface UsageCounter {
  user_id: string
  date: string
  words_used: number
}

export interface History {
  id: string
  user_id: string
  created_at: string
  tone: string
  input_text: string
  output_text: string
  explanations?: Array<{
    original: string
    revised: string
    rationale: string
  }>
} 