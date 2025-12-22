import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { stripe, PRICE_IDS, PlanType } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await req.json() as { plan: PlanType };
    
    // Validate plan type
    const validPlans: PlanType[] = ['quarterly', 'biannual', 'annual', 'quarterly_coaching', 'biannual_coaching', 'annual_coaching'];
    if (!validPlans.includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      );
    }
    
    // Get price ID for selected plan
    const priceId = PRICE_IDS[plan];
    
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price not configured for this plan' },
        { status: 400 }
      );
    }
    
    // Check for existing Stripe customer
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    let customerId = subscription?.stripe_customer_id;

    // Create new customer if needed
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;

      // Store customer ID
      await supabase.from('subscriptions').upsert({
        user_id: user.id,
        stripe_customer_id: customerId,
        status: 'inactive',
      }, {
        onConflict: 'user_id'
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/chat?upgrade=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/chat?upgrade=canceled`,
      allow_promotion_codes: true,
      metadata: {
        user_id: user.id,
        plan_type: plan,
        includes_coaching: plan.includes('coaching') ? 'true' : 'false',
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_type: plan,
          includes_coaching: plan.includes('coaching') ? 'true' : 'false',
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[Stripe Checkout] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
