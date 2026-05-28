import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

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

        // Send confirmation email to purchaser
        const resendApiKey = process.env.RESEND_API_KEY;
        if (!resendApiKey) {
          console.warn('Missing RESEND_API_KEY environment variable. Skipping confirmation email.');
        } else if (userEmail) {
          try {
            const resend = new Resend(resendApiKey);
            let recipientName = 'there';
            const userId = session.metadata?.user_id;

            if (userId) {
              const { data: profile, error: profileError } = await supabase
                .from('cfi_profile')
                .select('full_name')
                .eq('user_id', userId)
                .maybeSingle();

              if (!profileError && profile?.full_name) {
                recipientName = profile.full_name;
              }
            }

            const priceText = plan === 'all_annual' ? '$99 per year' : '$9.99 per month';
            const trialEndVal = subscription.trial_end;
            const trialDateObj = trialEndVal ? new Date(trialEndVal * 1000) : new Date();
            const formattedTrialEnd = trialDateObj.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            });

            const subject = 'Your 61 Tracker free trial has started';
            const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #101F33; margin: 0; padding: 20px; background-color: #ffffff;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E2E8F0; border-radius: 12px;">
    <div style="margin-bottom: 24px; border-bottom: 2px solid #e8a020; display: inline-block; padding-bottom: 4px;">
      <h1 style="color: #101F33; font-size: 20px; font-weight: 800; margin: 0; letter-spacing: -0.01em; text-transform: uppercase;">61 Tracker</h1>
    </div>
    <p style="font-size: 16px; margin-bottom: 16px;">Hi ${recipientName},</p>
    <div style="background-color: #F8FAFC; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
      <p style="margin: 0;">Your 30-day free trial is now active and you have full access to all ratings.</p>
      <p style="margin: 12px 0 0 0;">The trial ends on <strong>${formattedTrialEnd}</strong>.</p>
      <p style="margin: 12px 0 0 0;">On that same date, your subscription begins and the first payment of <strong>${priceText}</strong> will be charged automatically to the card on file, with nothing charged before then.</p>
      <p style="margin: 12px 0 0 0;">You can cancel anytime before that date from your Account page and you will not be charged.</p>
    </div>
    <p style="font-size: 16px; margin-top: 32px; font-weight: bold;">Best regards,<br/>The 61 Tracker Team</p>
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #E2E8F0; text-align: center;">
      <p style="font-size: 12px; color: #64748B; margin: 0; font-style: italic;">Sent via 61 Tracker — The modern toolkit for Part 61 CFIs</p>
    </div>
  </div>
</body>
</html>`;

            await resend.emails.send({
              from: '61 Tracker <noreply@61tracker.com>',
              to: [userEmail],
              subject: subject,
              html: html,
            });
            console.log('Confirmation email successfully sent to:', userEmail);
          } catch (emailErr) {
            console.error('Failed to send confirmation email but letting webhook succeed:', emailErr);
          }
        }

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
