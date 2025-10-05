import type { NextApiRequest, NextApiResponse } from 'next'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { getUserAccess } from '../../utils/access.server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const supabase = createServerSupabaseClient({ req, res })
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session?.user) {
      return res.status(200).json({
        authenticated: false,
        onboardingComplete: false,
        plan: null,
        limits: null
      })
    }

    const userAccess = await getUserAccess(session.user.id)

    return res.status(200).json({
      authenticated: true,
      onboardingComplete: userAccess.onboardingComplete,
      plan: userAccess.plan,
      limits: userAccess.limits
    })

  } catch (error) {
    console.error('Error in /api/me:', error)
    return res.status(500).json({
      authenticated: false,
      onboardingComplete: false,
      plan: null,
      limits: null,
      error: 'Internal server error'
    })
  }
} 