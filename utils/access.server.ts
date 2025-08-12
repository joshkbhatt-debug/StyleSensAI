// SERVER ONLY – do not import in client/components.
import { supabaseAdmin } from '../lib/supabaseAdmin'
import { PLAN_LIMITS, PLANS, PlanType } from './plans'

export interface UserAccess {
  plan: PlanType
  limits: {
    dailyWords: number
    features: string[]
  }
  hasActiveSubscription: boolean
  onboardingComplete: boolean
}

export async function getUserAccess(userId: string): Promise<UserAccess> {
  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('onboarding_complete')
      .eq('user_id', userId)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError)
    }

    // Get active subscription
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('plan, status, current_period_end')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (subError && subError.code !== 'PGRST116') {
      console.error('Error fetching subscription:', subError)
    }

    const plan = (subscription?.plan as PlanType) || PLANS.FREE
    const hasActiveSubscription = !!subscription && subscription.status === 'active'
    const onboardingComplete = profile?.onboarding_complete || false

    return {
      plan,
      limits: {
        dailyWords: PLAN_LIMITS[plan].dailyWords,
        features: [...PLAN_LIMITS[plan].features]
      },
      hasActiveSubscription,
      onboardingComplete
    }
  } catch (error) {
    console.error('Error getting user access:', error)
    return {
      plan: PLANS.FREE,
      limits: {
        dailyWords: PLAN_LIMITS[PLANS.FREE].dailyWords,
        features: [...PLAN_LIMITS[PLANS.FREE].features]
      },
      hasActiveSubscription: false,
      onboardingComplete: false
    }
  }
}

export async function checkWordLimit(userId: string, wordsToAdd: number): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const today = new Date().toISOString().split('T')[0]
    const access = await getUserAccess(userId)
    
    // Get today's usage
    const { data: usage, error } = await supabaseAdmin
      .from('usage_counters')
      .select('words_used')
      .eq('user_id', userId)
      .eq('date', today)
      .single()

    const currentUsage = usage?.words_used || 0
    const remaining = access.limits.dailyWords - currentUsage
    const allowed = remaining >= wordsToAdd

    return { allowed, remaining }
  } catch (error) {
    console.error('Error checking word limit:', error)
    return { allowed: false, remaining: 0 }
  }
}

export async function incrementWordUsage(userId: string, wordsUsed: number): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    // Upsert usage counter
    const { error } = await supabaseAdmin
      .from('usage_counters')
      .upsert({
        user_id: userId,
        date: today,
        words_used: wordsUsed
      }, {
        onConflict: 'user_id,date'
      })

    if (error) {
      console.error('Error incrementing word usage:', error)
    }
  } catch (error) {
    console.error('Error incrementing word usage:', error)
  }
} 