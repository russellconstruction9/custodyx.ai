import { loadStripe } from '@stripe/stripe-js'

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

if (!stripePublishableKey) {
  throw new Error('Missing VITE_STRIPE_PUBLISHABLE_KEY environment variable')
}

export const stripePromise = loadStripe(stripePublishableKey)

// Stripe pricing configuration
export const STRIPE_PRICES = {
  Plus: {
    monthly: 'price_plus_monthly_id', // Replace with actual Stripe price ID
    yearly: 'price_plus_yearly_id'
  },
  Pro: {
    monthly: 'price_pro_monthly_id', // Replace with actual Stripe price ID
    yearly: 'price_pro_yearly_id'
  }
}

export const SUBSCRIPTION_FEATURES = {
  Free: {
    name: 'Free',
    price: '$0',
    priceId: null,
    features: [
      'Basic incident logging',
      '50,000 AI tokens/month',
      'Timeline & calendar views',
      'Export to PDF'
    ]
  },
  Plus: {
    name: 'Plus',
    price: '$29',
    priceId: STRIPE_PRICES.Plus.monthly,
    features: [
      'Everything in Free',
      '500,000 AI tokens/month',
      'Pattern analysis',
      'Document library',
      'Legal assistant',
      'Priority support'
    ]
  },
  Pro: {
    name: 'Professional',
    price: '$79',
    priceId: STRIPE_PRICES.Pro.monthly,
    features: [
      'Everything in Plus',
      '5,000,000 AI tokens/month',
      'Deep behavioral insights',
      'AI voice agent',
      'Evidence package builder',
      'Advanced analytics',
      'Custom templates',
      'Priority consultation requests'
    ]
  }
}