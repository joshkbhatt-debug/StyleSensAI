import type { NextApiRequest, NextApiResponse } from 'next'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { checkWordLimit } from '../../../utils/access.server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const supabase = createServerSupabaseClient({ req, res })
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session?.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { wordsToAdd } = req.body
    if (typeof wordsToAdd !== 'number' || wordsToAdd < 0) {
      return res.status(400).json({ error: 'Invalid wordsToAdd parameter' })
    }

    const result = await checkWordLimit(session.user.id, wordsToAdd)

    return res.status(200).json(result)
  } catch (error) {
    console.error('Error checking word usage:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
} 