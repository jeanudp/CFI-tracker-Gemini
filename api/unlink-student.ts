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
  let studentUserId: string;

  try {
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      console.error('Student token verification failed:', authError);
      return res.status(401).json({ error: 'Invalid or expired authorization token' });
    }
    studentUserId = user.id;
  } catch (err: any) {
    console.error('Unexpected error verifying token:', err);
    return res.status(401).json({ error: 'Invalid or expired authorization token' });
  }

  const { cfi_user_id, student_name } = req.body;
  if (!cfi_user_id || !student_name) {
    return res.status(400).json({ error: 'Missing cfi_user_id or student_name in request body' });
  }

  try {
    const { error: deleteError } = await supabaseAdmin
      .from('student_links')
      .delete()
      .eq('student_user_id', studentUserId)
      .eq('cfi_user_id', cfi_user_id)
      .eq('student_name', student_name);

    if (deleteError) {
      throw deleteError;
    }

    return res.status(200).json({
      success: true,
      message: 'Instructor successfully unlinked'
    });

  } catch (err: any) {
    console.error('Unexpected database or API error during unlinking:', err);
    return res.status(500).json({ error: err.message || 'Internal server error during unlinking work' });
  }
}
