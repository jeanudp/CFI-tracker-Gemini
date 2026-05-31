import { createClient } from '@supabase/supabase-js';
import type { Request, Response } from 'express';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://nfmzoesbzgqubbeuwetq.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.body;
  const authHeader = req.headers.authorization;

  if (!code) {
    return res.status(400).json({ error: 'Invite code is required' });
  }

  if (!authHeader) {
    return res.status(400).json({ error: 'Authorization header is required' });
  }

  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) {
    return res.status(400).json({ error: 'Bearer token is required in Authorization header' });
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

    // Look up the invite code in 'invite_codes'
    const { data: inviteData, error: inviteError } = await supabaseAdmin
      .from('invite_codes')
      .select('*')
      .eq('code', code)
      .eq('used', false)
      .maybeSingle();

    if (inviteError) {
      console.error('Error lookup invite code:', inviteError);
      return res.status(500).json({ error: inviteError.message });
    }

    if (!inviteData) {
      return res.status(400).json({ error: 'Invalid or already used invite code.' });
    }

    // Mark the invite code as used
    const { error: codeUpdateError } = await supabaseAdmin
      .from('invite_codes')
      .update({
        used: true,
        used_by: user.email,
        used_at: new Date().toISOString()
      })
      .eq('code', code); // or .eq('id', inviteData.id)

    if (codeUpdateError) {
      console.error('Error marking invite code as used:', codeUpdateError);
      return res.status(500).json({ error: codeUpdateError.message });
    }

    // Update verified user's user_subscriptions row
    const { error: subUpdateError } = await supabaseAdmin
      .from('user_subscriptions')
      .update({
        plan: 'invite',
        ratings_unlocked: ['ppl', 'ir', 'cpl', 'cfi', 'cfii', 'mei']
      })
      .eq('user_id', user.id);

    if (subUpdateError) {
      console.error('Error updating user subscription:', subUpdateError);
      return res.status(500).json({ error: subUpdateError.message });
    }

    return res.status(200).json({ success: true, message: 'Invite code redeemed successfully' });
  } catch (err: any) {
    console.error('Exception during invite code redemption:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
