import type { NextApiRequest, NextApiResponse } from 'next'
import { callAIProvider, AIProvider } from '../../utils/aiProviders'
import { SYSTEM_PROMPT, buildUserPrompt } from '../../utils/prompts'
import { supabaseAdmin } from '../../lib/supabaseAdmin'
import { checkWordLimit, incrementWordUsage } from '../../utils/access.server'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'

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

    const { text, style, provider = 'openai' } = req.body as {
      text?: string
      style?: string
      provider?: AIProvider
    }

    if (!text || !style) {
      return res.status(400).json({ error: 'Missing text or style' })
    }

    const wordCount = text.trim().split(/\s+/).length

    const limitCheck = await checkWordLimit(session.user.id, wordCount)
    if (!limitCheck.allowed) {
      return res.status(429).json({
        error: 'Daily word limit exceeded',
        remaining: limitCheck.remaining
      })
    }

    const userPrompt = buildUserPrompt(text, style)

    const result = await callAIProvider(provider, SYSTEM_PROMPT, userPrompt)

    await incrementWordUsage(session.user.id, wordCount)

    return res.status(200).json(result)
  } catch (error: any) {
    console.error('Analysis API error:', error)
    return res.status(500).json({
      error: error.message || 'AI processing failed'
    })
  }
}