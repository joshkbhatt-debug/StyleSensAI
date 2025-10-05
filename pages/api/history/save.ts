import type { NextApiRequest, NextApiResponse } from 'next'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { saveAnalysis } from '../../../lib/supabaseServer'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const supabase = createServerSupabaseClient({ req, res })
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session?.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { text, tones, revised, explanations } = req.body

    if (!text || !Array.isArray(tones) || !revised || !Array.isArray(explanations)) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const result = await saveAnalysis({
      userId: session.user.id,
      text,
      tones,
      revised,
      explanations,
    })

    return res.status(200).json({ id: result.id })
  } catch (error: any) {
    console.error('Error saving history:', error)
    return res.status(500).json({ error: error.message || 'Failed to save history' })
  }
} 