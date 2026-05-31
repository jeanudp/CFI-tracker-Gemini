import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://nfmzoesbzgqubbeuwetq.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any,
});

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header is required' });
  }

  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) {
    return res.status(401).json({ error: 'Bearer token is required in Authorization header' });
  }

  const { priceId } = req.body;

  if (!priceId) {
    return res.status(400).json({ error: 'Price ID is required' });
  }

  // Validate the requested priceId against environment variables
  const validPrices = [
    process.env.VITE_STRIPE_PRICE_SINGLE,
    process.env.VITE_STRIPE_PRICE_ALL_MONTHLY,
    process.env.VITE_STRIPE_PRICE_ALL_ANNUAL
  ].filter(Boolean);

  if (!validPrices.includes(priceId)) {
    return res.status(400).json({ error: 'Invalid or unsupported price ID.' });
  }

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is missing');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Verify the caller's JWT access token to get authenticated user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error('Token verification failed:', authError);
      return res.status(401).json({ error: 'Invalid or expired authorization token' });
    }

    const userId = user.id;
    const email = user.email;

    if (!email) {
      return res.status(400).json({ error: 'User does not have an email address' });
    }

    let hasUsedTrial = false;

    try {
      const { data, error } = await supabaseAdmin
        .from('user_subscriptions')
        .select('has_used_trial')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data) {
        hasUsedTrial = !!data.has_used_trial;
      }
    } catch (err) {
      console.error('Failed to look up user subscription trial status:', err);
    }

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
