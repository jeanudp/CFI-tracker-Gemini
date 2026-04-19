import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable: any) {
  const chunks: any[] = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret!);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Use non-VITE env vars for serverless functions
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    return res.status(500).json({ error: 'Missing Supabase credentials' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const getPlan = (priceId: string) => {
    if (priceId === process.env.VITE_STRIPE_PRICE_ALL_MONTHLY) return 'all_monthly';
    if (priceId === process.env.VITE_STRIPE_PRICE_ALL_ANNUAL) return 'all_annual';
    return 'all_monthly';
  };

  const getRatingsForPlan = (plan: string) => {
    return ['ppl', 'ir', 'cpl', 'cfi', 'cfii', 'mei'];
  };

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const userEmail = session.customer_email || session.customer_details?.email;

        console.log('checkout.session.completed for:', userEmail);

        const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
        const priceId = subscription.items.data[0].price.id;
        const plan = getPlan(priceId);
        const ratings = getRatingsForPlan(plan);

        console.log('Updating subscription for:', userEmail, 'plan:', plan, 'ratings:', ratings);

        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            plan,
            status: subscription.status,
            ratings_unlocked: ratings,
            trial_end: subscription.trial_end
              ? new Date(subscription.trial_end * 1000).toISOString()
              : null,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('email', userEmail);

        if (updateError) {
          console.error('Supabase update error:', updateError);
          return res.status(500).json({ error: updateError.message });
        }

        console.log('Successfully updated subscription for:', userEmail);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        const priceId = subscription.items.data[0].price.id;
        const plan = getPlan(priceId);
        const ratings = getRatingsForPlan(plan);

        await supabase
          .from('user_subscriptions')
          .update({
            plan,
            status: subscription.status,
            ratings_unlocked: ratings,
            trial_end: subscription.trial_end
              ? new Date(subscription.trial_end * 1000).toISOString()
              : null,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        await supabase
          .from('user_subscriptions')
          .update({
            plan: 'free',
            status: 'canceled',
            ratings_unlocked: ['ppl'],
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;

        await supabase
          .from('user_subscriptions')
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', invoice.subscription as string);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err: any) {
    console.error('Webhook handler error:', err);
    return res.status(500).json({ error: err.message });
  }

  return res.status(200).json({ received: true });
}
