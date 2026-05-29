import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any,
});

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { priceId, email, userId } = req.body;

  if (!priceId || !email || !userId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  let hasUsedTrial = false;

  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('has_used_trial')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data) {
        hasUsedTrial = !!data.has_used_trial;
      }
    }
  } catch (err) {
    console.error('Failed to look up user subscription trial status:', err);
  }

  try {
    const subscriptionData: any = {
      metadata: {
        user_id: userId,
      },
    };

    if (!hasUsedTrial) {
      subscriptionData.trial_period_days = 30;
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: subscriptionData,
      success_url: `${process.env.VITE_APP_URL || 'https://cfi-tracker-gemini.vercel.app'}/dashboard?subscription=success`,
      cancel_url: `${process.env.VITE_APP_URL || 'https://cfi-tracker-gemini.vercel.app'}/rating?subscription=canceled`,
      metadata: {
        user_id: userId,
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error('Checkout session error:', err);
    return res.status(500).json({ error: err.message });
  }
}

