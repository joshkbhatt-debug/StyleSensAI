import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client using service role key
// This should ONLY be used in API routes and server-side code
// NEVER expose this client to the frontend
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables for server client')
}

export const supabaseServerClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Type for document data
export interface DocumentData {
  user_id: string
  original: string
  rewritten: string
}

// Type for API response
export interface SaveDocumentResponse {
  success: boolean
  data?: any
  error?: string
} 