import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../lib/supabaseAdmin'
import { getUserAccess } from '../../utils/access.server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get session from auth cookie or Authorization header
    const authHeader = req.headers.authorization
    let userId: string | null = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
      if (!error && user) {
        userId = user.id
      }
    } else {
      // Try to get session from cookies
      const { data: { session }, error } = await supabaseAdmin.auth.getSession()
      if (!error && session?.user) {
        userId = session.user.id
      }
    }

    if (!userId) {
      return res.status(200).json({
        authenticated: false,
        onboardingComplete: false,
        plan: null,
        limits: null
      })
    }

    // Get user access using server-side utility
    const userAccess = await getUserAccess(userId)

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