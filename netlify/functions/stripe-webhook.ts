import { Handler } from '@netlify/functions'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const sig = event.headers['stripe-signature']!
  let stripeEvent: Stripe.Event

  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body!, sig, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return { statusCode: 400, body: 'Webhook signature verification failed' }
  }

  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = stripeEvent.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }
      
      case 'customer.subscription.deleted': {
        const subscription = stripeEvent.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = stripeEvent.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice)
        break
      }
      
      case 'invoice.payment_failed': {
        const invoice = stripeEvent.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }
      
      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`)
    }

    return { statusCode: 200, body: 'Success' }
  } catch (error) {
    console.error('Webhook handler error:', error)
    return { statusCode: 500, body: 'Internal server error' }
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id
  if (!userId) {
    console.error('No user_id in checkout session metadata')
    return
  }

  if (session.mode === 'subscription' && session.subscription) {
    // Get the subscription details
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
    await upsertSubscription(userId, subscription)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = await getUserIdFromCustomer(subscription.customer as string)
  if (!userId) return
  
  await upsertSubscription(userId, subscription)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = await getUserIdFromCustomer(subscription.customer as string)
  if (!userId) return
  
  // Update subscription status to cancelled
  await supabase
    .from('subscriptions')
    .update({ 
      status: 'cancelled',
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
    })
    .eq('stripe_subscription_id', subscription.id)
  
  // Reset user to Free tier
  await supabase
    .from('profiles')
    .update({ subscription_tier: 'Free' })
    .eq('id', userId)
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
    const userId = await getUserIdFromCustomer(subscription.customer as string)
    if (!userId) return
    
    await upsertSubscription(userId, subscription)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
    const userId = await getUserIdFromCustomer(subscription.customer as string)
    if (!userId) return
    
    // Update subscription status to past_due
    await supabase
      .from('subscriptions')
      .update({ status: 'past_due' })
      .eq('stripe_subscription_id', subscription.id)
  }
}

async function getUserIdFromCustomer(customerId: string): Promise<string | null> {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()
  
  return data?.id || null
}

async function upsertSubscription(userId: string, subscription: Stripe.Subscription) {
  // Determine subscription tier from price
  const priceId = subscription.items.data[0]?.price?.id
  let tier: 'Free' | 'Plus' | 'Pro' = 'Free'
  
  // This mapping should match your Stripe price IDs
  const priceToTierMap: Record<string, 'Plus' | 'Pro'> = {
    'price_plus_monthly_id': 'Plus',
    'price_plus_yearly_id': 'Plus',
    'price_pro_monthly_id': 'Pro',
    'price_pro_yearly_id': 'Pro'
  }
  
  if (priceId && priceToTierMap[priceId]) {
    tier = priceToTierMap[priceId]
  }

  // Update subscription record
  await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
    })
  
  // Update user's subscription tier
  await supabase
    .from('profiles')
    .update({ subscription_tier: tier })
    .eq('id', userId)
}