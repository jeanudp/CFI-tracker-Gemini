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
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error('Token verification failed:', authError);
      return res.status(401).json({ error: 'Invalid or expired authorization token' });
    }

    const { data: subData, error: subError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (subError) {
      console.error('Database query error:', subError);
      return res.status(500).json({ error: subError.message });
    }

    if (!subData || !subData.stripe_customer_id) {
      return res.status(400).json({ error: 'No billing account found for this user.' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subData.stripe_customer_id,
      return_url: `${process.env.VITE_APP_URL || 'https://cfi-tracker-gemini.vercel.app'}/account`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error('Portal session error:', err);
    return res.status(500).json({ error: err.message });
  }
}
