import type { NextApiRequest, NextApiResponse } from 'next'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { incrementWordUsage } from '../../../utils/access.server'

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

    const { wordsUsed } = req.body
    if (typeof wordsUsed !== 'number' || wordsUsed < 0) {
      return res.status(400).json({ error: 'Invalid wordsUsed parameter' })
    }

    await incrementWordUsage(session.user.id, wordsUsed)

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error incrementing word usage:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
} 