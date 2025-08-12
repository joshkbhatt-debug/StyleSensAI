// CLIENT ONLY – uses /api/me endpoint instead of direct database access
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

export async function getUserAccess(): Promise<UserAccess> {
  try {
    const response = await fetch('/api/me')
    const data = await response.json()

    if (!data.authenticated) {
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

    const plan = (data.plan as PlanType) || PLANS.FREE
    const hasActiveSubscription = data.plan !== 'free' && data.plan !== null
    const onboardingComplete = data.onboardingComplete || false

    return {
      plan,
      limits: data.limits || {
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

export async function checkWordLimit(wordsToAdd: number): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const access = await getUserAccess()
    
    // For client-side, we'll need to call a separate API endpoint to get current usage
    const response = await fetch('/api/usage/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ wordsToAdd })
    })
    
    if (response.ok) {
      const data = await response.json()
      return { allowed: data.allowed, remaining: data.remaining }
    }

    // Fallback to client-side calculation (less accurate)
    const remaining = access.limits.dailyWords - wordsToAdd
    const allowed = remaining >= 0

    return { allowed, remaining }
  } catch (error) {
    console.error('Error checking word limit:', error)
    return { allowed: false, remaining: 0 }
  }
} 