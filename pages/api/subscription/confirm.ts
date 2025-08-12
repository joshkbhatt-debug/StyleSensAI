import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { sessionId } = req.body

    if (!sessionId) {
      return res.status(400).json({ error: 'Missing session ID' })
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' })
    }

    const { userId, plan } = session.metadata!

    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

    // Create or update subscription in database
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .upsert({
        user_id: userId,
        plan: plan,
        status: subscription.status,
        current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      })

    if (error) {
      console.error('Error saving subscription:', error)
      return res.status(500).json({ error: 'Failed to save subscription' })
    }

    res.status(200).json({ 
      success: true, 
      message: 'Subscription confirmed',
      plan,
      status: subscription.status
    })
  } catch (error) {
    console.error('Subscription confirmation error:', error)
    res.status(500).json({ error: 'Failed to confirm subscription' })
  }
} 