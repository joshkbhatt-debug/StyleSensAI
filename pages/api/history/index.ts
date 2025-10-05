import type { NextApiRequest, NextApiResponse } from 'next'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { getUserHistory } from '../../../lib/supabaseServer'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const supabase = createServerSupabaseClient({ req, res })
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session?.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const history = await getUserHistory(session.user.id, 20)

    return res.status(200).json(history)
  } catch (error: any) {
    console.error('Error fetching history:', error)
    return res.status(500).json({ error: error.message || 'Failed to fetch history' })
  }
} 