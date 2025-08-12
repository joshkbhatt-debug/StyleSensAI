export const PLANS = {
  FREE: 'free',
  PLUS: 'plus',
  PRO: 'pro'
} as const

export type PlanType = typeof PLANS[keyof typeof PLANS]

export const PLAN_LIMITS = {
  [PLANS.FREE]: {
    dailyWords: 1500,
    features: ['basic'],
    price: 0,
    name: 'Free'
  },
  [PLANS.PLUS]: {
    dailyWords: 15000,
    features: ['allTones', 'allActions', 'explain'],
    price: 5,
    name: 'Plus'
  },
  [PLANS.PRO]: {
    dailyWords: 60000,
    features: ['priority', 'all'],
    price: 10,
    name: 'Pro'
  }
} as const

export const STRIPE_PRICES = {
  [PLANS.PLUS]: process.env.NEXT_PUBLIC_STRIPE_PRICE_PLUS!,
  [PLANS.PRO]: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO!
} as const 