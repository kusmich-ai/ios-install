// /app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Use service role for webhook operations (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    console.error('[Stripe Webhook] Missing signature');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  
  // Initialize Stripe inside the handler (not at module level)
  const stripe = getStripe();

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log(`[Stripe Webhook] Event received: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session, stripe);
        break;
      }
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription, stripe);
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('[Stripe Webhook] Payment succeeded:', invoice.id);
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook] Handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session, stripe: Stripe) {
  const userId = session.metadata?.user_id;
  
  if (!userId) {
    console.error('[Stripe Webhook] No user_id in checkout session metadata');
    return;
  }

  console.log(`[Stripe Webhook] Checkout complete for user: ${userId}`);

  const subscriptionId = session.subscription as string;
  
  if (!subscriptionId) {
    console.error('[Stripe Webhook] No subscription ID in checkout session');
    return;
  }

  // Fetch full subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Extract plan_type from metadata or infer from price ID
  let planType = subscription.metadata?.plan_type || null;
  let interval = subscription.metadata?.interval || null;
  
  const priceId = subscription.items.data[0]?.price.id;
  if (!planType && priceId) {
    planType = priceId.includes('coaching') ? 'ios_coaching' : 'ios_installer';
  }

  const { error } = await supabase.from('subscriptions').upsert({
    user_id: userId,
    stripe_customer_id: session.customer as string,
    stripe_subscription_id: subscriptionId,
    status: subscription.status,
    plan_id: priceId,
    plan_type: planType,
    interval: interval,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
  }, {
    onConflict: 'user_id'
  });

  if (error) {
    console.error('[Stripe Webhook] Error upserting subscription:', error);
    throw error;
  }

  // Update convenience flag on user_progress
  const { error: progressError } = await supabase
    .from('user_progress')
    .update({ has_active_subscription: true })
    .eq('user_id', userId);

  if (progressError) {
    console.error('[Stripe Webhook] Error updating user_progress:', progressError);
  }

  console.log(`[Stripe Webhook] Subscription activated for user: ${userId}`);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription, stripe: Stripe) {
  // Try to get user_id from subscription metadata
  let userId = subscription.metadata?.user_id;
  
  // If not in subscription metadata, look up by stripe_subscription_id
  if (!userId) {
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscription.id)
      .single();
    
    userId = existingSub?.user_id;
  }

  // If still no user_id, try to find user by customer email (for manual/gifted subscriptions)
  if (!userId && subscription.customer) {
    try {
      const customer = await stripe.customers.retrieve(subscription.customer as string);
      
      if (customer && !customer.deleted && 'email' in customer && customer.email) {
        const customerEmail = customer.email.toLowerCase();
        console.log(`[Stripe Webhook] Looking up user by email: ${customerEmail}`);
        
        // First try user_profiles table
        const { data: profileUser } = await supabase
          .from('user_profiles')
          .select('id')
          .ilike('email', customerEmail)
          .single();
        
        if (profileUser) {
          userId = profileUser.id;
          console.log(`[Stripe Webhook] Found user by email in user_profiles: ${userId}`);
        }
        
        // If not found in user_profiles, try auth.users via admin API
        if (!userId) {
          const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
          
          if (!listError && users) {
            const matchedUser = users.find(u => u.email?.toLowerCase() === customerEmail);
            if (matchedUser) {
              userId = matchedUser.id;
              console.log(`[Stripe Webhook] Found user by email in auth.users: ${userId}`);
            }
          }
        }
      }
    } catch (emailLookupError) {
      console.error('[Stripe Webhook] Email lookup failed:', emailLookupError);
    }
  }

  if (!userId) {
    console.error('[Stripe Webhook] Cannot find user_id for subscription:', subscription.id);
    console.error('[Stripe Webhook] Customer ID:', subscription.customer);
    console.error('[Stripe Webhook] Metadata:', subscription.metadata);
    return;
  }

  const isActive = ['active', 'trialing'].includes(subscription.status);

  console.log(`[Stripe Webhook] Subscription update for user ${userId}: ${subscription.status}`);

  // Extract plan_type from metadata or infer from price ID
  let planType = subscription.metadata?.plan_type || null;
  let interval = subscription.metadata?.interval || null;
  
  const priceId = subscription.items.data[0]?.price.id;
  if (!planType && priceId) {
    planType = priceId.includes('coaching') ? 'ios_coaching' : 'ios_installer';
  }

  const { error } = await supabase.from('subscriptions').upsert({
    user_id: userId,
    stripe_customer_id: subscription.customer as string,
    stripe_subscription_id: subscription.id,
    status: subscription.status,
    plan_id: priceId,
    plan_type: planType,
    interval: interval,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
  }, {
    onConflict: 'user_id'
  });

  if (error) {
    console.error('[Stripe Webhook] Error updating subscription:', error);
  }

  // Update convenience flag
  await supabase
    .from('user_progress')
    .update({ has_active_subscription: isActive })
    .eq('user_id', userId);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Look up user by subscription ID
  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (!existingSub?.user_id) {
    console.error('[Stripe Webhook] Cannot find user for deleted subscription:', subscription.id);
    return;
  }

  const userId = existingSub.user_id;

  console.log(`[Stripe Webhook] Subscription deleted for user: ${userId}`);

  await supabase
    .from('subscriptions')
    .update({ status: 'canceled' })
    .eq('stripe_subscription_id', subscription.id);

  await supabase
    .from('user_progress')
    .update({ has_active_subscription: false })
    .eq('user_id', userId);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  
  if (!subscriptionId) {
    return;
  }

  console.log(`[Stripe Webhook] Payment failed for subscription: ${subscriptionId}`);

  // Update status to past_due
  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('stripe_subscription_id', subscriptionId);

  if (error) {
    console.error('[Stripe Webhook] Error updating subscription to past_due:', error);
  }
}
