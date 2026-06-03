import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://nfmzoesbzgqubbeuwetq.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req: any, res: any) {
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

  const { token, action } = req.body;

  // 1. Read an optional logged-in session.
  // At the start of the handler, after parsing the body, check for an Authorization header in the form "Bearer <access token>".
  // If present, verify it using the admin client's getUser method, passing the access token, to obtain the logged-in user.
  // If verification succeeds, remember that user's id as the "session user id." If the header is absent or verification fails, treat it as no session.
  const authHeader = req.headers.authorization || req.headers.Authorization;
  let sessionUserId: string | null = null;
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const accessToken = authHeader.substring(7);
    try {
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
      if (!authError && user) {
        sessionUserId = user.id;
      }
    } catch (err) {
      console.error('Error verifying session of student user:', err);
    }
  }

  // 2. Change the top-level guard.
  // Only return the 400 "token required" error if neither token nor valid session user id is present.
  if (!token && !sessionUserId) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    // 3. Add a new claim action.
    if (action === 'claim') {
      if (!token || !sessionUserId) {
        return res.status(400).json({ error: 'Token and active session are required for claiming' });
      }

      // Validate the share token exactly the way the existing code does
      const { data: shareToken, error: tokenError } = await supabaseAdmin
        .from('student_share_tokens')
        .select('student_name, user_id')
        .eq('token', token)
        .eq('active', true)
        .single();

      if (tokenError || !shareToken) {
        return res.status(404).json({ error: 'Link is invalid or expired' });
      }

      const { student_name: tokenStudentName, user_id: tokenCfiUserId } = shareToken;

      // Check if that exact combination already exists in student_links
      const { data: existingLink, error: linkCheckError } = await supabaseAdmin
        .from('student_links')
        .select('id')
        .eq('student_user_id', sessionUserId)
        .eq('cfi_user_id', tokenCfiUserId)
        .eq('student_name', tokenStudentName)
        .maybeSingle();

      if (linkCheckError) throw linkCheckError;

      if (!existingLink) {
        const { error: insertError } = await supabaseAdmin
          .from('student_links')
          .insert({
            student_user_id: sessionUserId,
            cfi_user_id: tokenCfiUserId,
            student_name: tokenStudentName
          });
        if (insertError) throw insertError;
      }

      // Update user_subscriptions setting account_type to 'student'
      const { error: subUpdateError } = await supabaseAdmin
        .from('user_subscriptions')
        .update({ account_type: 'student' })
        .eq('user_id', sessionUserId);

      if (subUpdateError) throw subUpdateError;

      return res.status(200).json({ success: true });
    }

    // Determine target CFI/student profile based on token vs. authenticated session
    let studentName = '';
    let userId = '';
    let linkedProfiles: any[] = [];

    if (token) {
      // Fetch share details
      const { data: shareToken, error: tokenError } = await supabaseAdmin
        .from('student_share_tokens')
        .select('student_name, user_id')
        .eq('token', token)
        .eq('active', true)
        .single();

      if (tokenError || !shareToken) {
        return res.status(404).json({ error: 'Link is invalid or expired' });
      }

      studentName = shareToken.student_name;
      userId = shareToken.user_id;

      // If they are logged-in, we can also optional list their linked profiles for UI convenience
      if (sessionUserId) {
        const { data: links, error: linksError } = await supabaseAdmin
          .from('student_links')
          .select('cfi_user_id, student_name')
          .eq('student_user_id', sessionUserId);
        if (!linksError && links) {
          linkedProfiles = links;
        }
      }
    } else {
      // 4. Add an authenticated data-fetch path (no share token, valid session).
      // Look up all rows in student_links where student_user_id equals the session user id.
      const { data: links, error: linksError } = await supabaseAdmin
        .from('student_links')
        .select('cfi_user_id, student_name')
        .eq('student_user_id', sessionUserId);

      if (linksError) throw linksError;

      if (!links || links.length === 0) {
        return res.status(200).json({
          studentName: '',
          userId: '',
          student: null,
          lessons: [],
          manualHours: [],
          endorsements: [],
          scheduledLessons: [],
          linkedProfiles: []
        });
      }

      linkedProfiles = links;

      // Choose the target profile
      const reqCfiUserId = req.body.cfi_user_id;
      const reqStudentName = req.body.student_name;

      let targetLink = links[0];
      if (reqCfiUserId && reqStudentName) {
        const match = links.find(
          (link: any) =>
            link.cfi_user_id === reqCfiUserId &&
            link.student_name === reqStudentName
        );
        if (match) {
          targetLink = match;
        }
      }

      studentName = targetLink.student_name;
      userId = targetLink.cfi_user_id;
    }

    // Process actions that use studentName and userId
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
          token: token || '',
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
        .eq('token', token || '');

      if (error) throw error;
      return res.status(200).json({ exports: data || [] });
    }

    if (action === 'submitTest') {
      const {
        answers,
        percentageScore,
        score,
        passed,
        totalQuestions,
        total_questions,
        correctAnswersCount,
        correct_answers,
        incorrectQuestionIds,
        incorrect_question_ids,
        date
      } = req.body;

      const finalScore = percentageScore !== undefined ? percentageScore : score;
      const finalTotalQuestions = totalQuestions !== undefined ? totalQuestions : total_questions;
      const finalCorrectAnswers = correctAnswersCount !== undefined ? correctAnswersCount : correct_answers;
      const finalIncorrectQuestionIds = incorrectQuestionIds !== undefined ? incorrectQuestionIds : incorrect_question_ids;

      const { error } = await supabaseAdmin
        .from('student_tests')
        .insert({
          user_id: userId,
          student_name: studentName,
          test_type: 'pre_solo',
          date: date || new Date().toISOString().split('T')[0],
          score: finalScore,
          passing_score: 80,
          passed: passed,
          total_questions: finalTotalQuestions,
          correct_answers: finalCorrectAnswers,
          incorrect_question_ids: finalIncorrectQuestionIds,
          answers: answers,
          source: 'student_portal',
          cfi_signed_off: false
        });

      if (error) throw error;
      return res.status(200).json({ success: true });
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
    const responseData: any = {
      studentName,
      userId,
      student: student || null,
      lessons: lessons || [],
      manualHours: manualHours || [],
      endorsements: endorsements || [],
      scheduledLessons: scheduledLessons || []
    };

    if (linkedProfiles && linkedProfiles.length > 0) {
      responseData.linkedProfiles = linkedProfiles;
    }

    return res.status(200).json(responseData);

  } catch (err: any) {
    console.error('Error fetching student portal data:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
