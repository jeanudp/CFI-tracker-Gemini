import { createClient } from '@supabase/supabase-js';
import type { Request, Response } from 'express';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://nfmzoesbzgqubbeuwetq.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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

  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Bearer token is required in Authorization header' });
  }

  const token = authHeader.substring(7);
  let userId: string;
  let userEmail: string;

  try {
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      console.error('Token verification failed:', authError);
      return res.status(401).json({ error: 'Invalid or expired authorization token' });
    }
    userId = user.id;
    userEmail = user.email || '';
  } catch (err: any) {
    console.error('Unexpected error verifying token:', err);
    return res.status(401).json({ error: 'Invalid or expired authorization token' });
  }

  try {
    // 1. Set account_type to 'student' in user_subscriptions
    const { data: existingSub, error: selectError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (selectError) {
      console.error('Error checking user_subscriptions:', selectError);
      throw selectError;
    }

    if (existingSub) {
      const { error: updateError } = await supabaseAdmin
        .from('user_subscriptions')
        .update({ account_type: 'student' })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating user_subscriptions:', updateError);
        throw updateError;
      }
    } else {
      const { error: insertError } = await supabaseAdmin
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          email: userEmail,
          account_type: 'student',
          plan: 'free',
          ratings_unlocked: ['ppl'],
          status: 'active'
        });

      if (insertError) {
        console.error('Error inserting into user_subscriptions:', insertError);
        throw insertError;
      }
    }

    // 2. Update user's auth metadata so account_type is "student"
    const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: { account_type: 'student' }
    });

    if (updateAuthError) {
      console.error('Error updating user auth metadata:', updateAuthError);
      throw updateAuthError;
    }

    return res.status(200).json({
      success: true,
      message: 'Account successfully set to student'
    });

  } catch (err: any) {
    console.error('Unexpected database or API error setting student account:', err);
    return res.status(500).json({ error: err.message || 'Internal server error during setting student account work' });
  }
}
