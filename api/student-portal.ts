import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://nfmzoesbzgqubbeuwetq.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, action } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
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
    // Validate the token: look up the student_share_tokens table for a row where the token matches and active is true
    const { data: shareToken, error: tokenError } = await supabaseAdmin
      .from('student_share_tokens')
      .select('student_name, user_id')
      .eq('token', token)
      .eq('active', true)
      .single();

    if (tokenError || !shareToken) {
      return res.status(404).json({ error: 'Link is invalid or expired' });
    }

    const { student_name: studentName, user_id: userId } = shareToken;

    if (action === 'requestLesson') {
      const { requested_date, preferred_time, lesson_type, notes } = req.body;
      const { error } = await supabaseAdmin
        .from('lesson_requests')
        .insert({
          user_id: userId,
          student_name: studentName,
          requested_date,
          preferred_time,
          lesson_type,
          notes,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    if (action === 'requestExport') {
      const { lesson_ids } = req.body;
      const { error } = await supabaseAdmin
        .from('student_exports')
        .insert({
          token,
          student_name: studentName,
          user_id: userId,
          lesson_ids: lesson_ids,
          lesson_count: Array.isArray(lesson_ids) ? lesson_ids.length : 0
        });

      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    if (action === 'getExports') {
      const { data, error } = await supabaseAdmin
        .from('student_exports')
        .select('lesson_ids')
        .eq('token', token);

      if (error) throw error;
      return res.status(200).json({ exports: data || [] });
    }

    // Fetch lessons: all columns where student_name matches and user_id matches and deleted_at is null, ordered by saved_at descending
    const { data: lessons, error: lessonsError } = await supabaseAdmin
      .from('lessons')
      .select('*')
      .eq('student_name', studentName)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('saved_at', { ascending: false });

    if (lessonsError) throw lessonsError;

    // Fetch manual_hours: all columns where student_name and user_id match
    const { data: manualHours, error: manualHoursError } = await supabaseAdmin
      .from('manual_hours')
      .select('*')
      .eq('student_name', studentName)
      .eq('user_id', userId);

    if (manualHoursError) throw manualHoursError;

    // Fetch endorsements: all columns where student_name and user_id match
    const { data: endorsements, error: endorsementsError } = await supabaseAdmin
      .from('endorsements')
      .select('*')
      .eq('student_name', studentName)
      .eq('user_id', userId);

    if (endorsementsError) throw endorsementsError;

    // Fetch student profile record from students table where name matches studentName and user_id matches
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .select('*')
      .eq('name', studentName)
      .eq('user_id', userId)
      .maybeSingle();

    if (studentError) {
      console.error('Failed to fetch student profile:', studentError);
    }

    // Fetch scheduled_lessons: all columns where student_name and user_id match and the date is today or later, 
    // ordered by date ascending then start_time ascending, limited to 5
    const todayStr = new Date().toISOString().split('T')[0];
    const { data: scheduledLessons, error: scheduledLessonsError } = await supabaseAdmin
      .from('scheduled_lessons')
      .select('*')
      .eq('student_name', studentName)
      .eq('user_id', userId)
      .gte('date', todayStr)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })
      .limit(5);

    if (scheduledLessonsError) throw scheduledLessonsError;

    // Return the response with the exact field names specified
    return res.status(200).json({
      studentName,
      userId,
      student: student || null,
      lessons: lessons || [],
      manualHours: manualHours || [],
      endorsements: endorsements || [],
      scheduledLessons: scheduledLessons || []
    });

  } catch (err: any) {
    console.error('Error fetching student portal data:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
