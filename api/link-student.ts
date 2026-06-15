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
  let cfiUserId: string;

  try {
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      console.error('CFI token verification failed:', authError);
      return res.status(401).json({ error: 'Invalid or expired authorization token' });
    }
    cfiUserId = user.id;
  } catch (err: any) {
    console.error('Unexpected error verifying token:', err);
    return res.status(401).json({ error: 'Invalid or expired authorization token' });
  }

  const { email: studentEmail, name: studentName, orgId } = req.body;
  if (!studentEmail || !studentName) {
    return res.status(400).json({ error: 'Missing student email or name in request body' });
  }

  try {
    // 1. Find user via listUsers Auth Admin API (case-insensitive lookup on registered accounts)
    let matchedUserId: string | null = null;
    let users: any[] = [];
    
    const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (!listError && listData && listData.users) {
      users = listData.users;
    } else if (listError) {
      console.error('Error listing users via admin API:', listError);
    }

    const targetUser = users.find(
      (u: any) => u.email && u.email.toLowerCase() === studentEmail.trim().toLowerCase()
    );

    if (targetUser) {
      matchedUserId = targetUser.id;
    } else {
      // Fallback dual check on user_subscriptions table to ensure accuracy if pagination limit was reached
      const { data: subData, error: subError } = await supabaseAdmin
        .from('user_subscriptions')
        .select('user_id')
        .ilike('email', studentEmail.trim())
        .maybeSingle();
      
      if (!subError && subData) {
        matchedUserId = subData.user_id;
      }
    }

    // 2. If no account is found, return successfully indicating not linked
    if (!matchedUserId) {
      return res.status(200).json({
        linked: false,
        message: 'no account found, not linked'
      });
    }

    // 3. Link existing account in student_links table if not already linked
    const { data: existingLink, error: checkError } = await supabaseAdmin
      .from('student_links')
      .select('id, status')
      .eq('student_user_id', matchedUserId)
      .eq('cfi_user_id', cfiUserId)
      .eq('student_name', studentName)
      .maybeSingle();

    if (checkError) {
      throw checkError;
    }

    if (existingLink) {
      if (orgId && existingLink.status === 'pending') {
        const { error: updateError } = await supabaseAdmin
          .from('student_links')
          .update({ status: 'approved' })
          .eq('id', existingLink.id);

        if (updateError) {
          throw updateError;
        }
      }
    } else {
      const statusValue = orgId ? 'approved' : 'pending';
      const { error: insertError } = await supabaseAdmin
        .from('student_links')
        .insert({
          student_user_id: matchedUserId,
          cfi_user_id: cfiUserId,
          student_name: studentName,
          status: statusValue
        });

      if (insertError) {
        throw insertError;
      }
    }

    const { data: studentProfile, error: profileError } = await supabaseAdmin
      .from('student_profiles')
      .select('*')
      .eq('student_user_id', matchedUserId)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching student profile during link:', profileError);
    }

    return res.status(200).json({
      linked: true,
      message: 'Student linked successfully',
      profile: studentProfile || null
    });

  } catch (err: any) {
    console.error('Unexpected database or API error logic:', err);
    return res.status(500).json({ error: err.message || 'Internal server error during linking work' });
  }
}
