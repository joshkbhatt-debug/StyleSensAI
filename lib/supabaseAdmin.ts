// SERVER ONLY – do not import in client/components.
import { createClient } from '@supabase/supabase-js'

// Check for multiple possible environment variable names
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  const missingVars = []
  if (!supabaseUrl) missingVars.push('SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL')
  if (!supabaseServiceKey) missingVars.push('SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY')
  
  throw new Error(`Missing required Supabase environment variables: ${missingVars.join(', ')}. Please check your .env.local file.`)
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
}) 