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

    if (action === 'updateProfile') {
      if (!sessionUserId) {
        return res.status(401).json({ error: 'Unauthorized: Valid session required' });
      }
      const { full_name, phone, dob, medical_class, medical_exam_date, student_cert_number } = req.body;

      const { error: upsertError } = await supabaseAdmin
        .from('student_profiles')
        .upsert({
          student_user_id: sessionUserId,
          full_name: full_name || null,
          phone: phone || null,
          dob: dob || null,
          medical_class: medical_class || null,
          medical_exam_date: medical_exam_date || null,
          student_cert_number: student_cert_number || null,
          updated_at: new Date().toISOString()
        }, { onConflict: 'student_user_id' });

      if (upsertError) {
        console.error('Error upserting student profile:', upsertError);
        return res.status(500).json({ error: 'Failed to update profile' });
      }

      // Propose changes to the selected instructor if provided and linked
      const { cfi_user_id, student_name } = req.body;
      if (cfi_user_id && student_name) {
        try {
          const { data: link, error: linkError } = await supabaseAdmin
            .from('student_links')
            .select('id')
            .eq('student_user_id', sessionUserId)
            .eq('cfi_user_id', cfi_user_id)
            .eq('student_name', student_name)
            .maybeSingle();

          if (!linkError && link) {
            // Delete old pending proposals for the same student, CFI, and status pending
            const { error: deleteError } = await supabaseAdmin
              .from('student_profile_proposals')
              .delete()
              .eq('student_user_id', sessionUserId)
              .eq('cfi_user_id', cfi_user_id)
              .eq('student_name', student_name)
              .eq('status', 'pending');

            if (deleteError) {
              console.error('Error deleting old pending proposals:', deleteError);
            }

            // Insert new proposal
            const { error: insertProposalError } = await supabaseAdmin
              .from('student_profile_proposals')
              .insert({
                student_user_id: sessionUserId,
                cfi_user_id: cfi_user_id,
                student_name: student_name,
                full_name: full_name || null,
                phone: phone || null,
                dob: dob || null,
                medical_class: medical_class || null,
                medical_exam_date: medical_exam_date || null,
                student_cert_number: student_cert_number || null,
                status: 'pending',
                created_at: new Date().toISOString()
              });

            if (insertProposalError) {
              console.error('Error inserting pending profile proposal:', insertProposalError);
            }
          }
        } catch (proposalErr) {
          console.error('Error in student profile proposal workflow:', proposalErr);
        }
      }

      return res.status(200).json({ success: true });
    }

    if (action === 'submitNote') {
      if (!sessionUserId) {
        return res.status(401).json({ error: 'Unauthorized: Valid session required' });
      }
      const { note, cfi_user_id, student_name } = req.body;
      if (!note || typeof note !== 'string' || !note.trim()) {
        return res.status(400).json({ error: 'Note text is required' });
      }

      if (cfi_user_id && student_name) {
        // Send a note only to the selected instructor
        const { data: link, error: linkError } = await supabaseAdmin
          .from('student_links')
          .select('id')
          .eq('student_user_id', sessionUserId)
          .eq('cfi_user_id', cfi_user_id)
          .eq('student_name', student_name)
          .maybeSingle();

        if (linkError) {
          console.error('Error verifying student link for note submit:', linkError);
          return res.status(500).json({ error: 'Database error' });
        }

        if (!link) {
          return res.status(400).json({ error: 'The selected instructor link could not be verified.' });
        }

        const { error: insertError } = await supabaseAdmin
          .from('student_notes')
          .insert({
            student_user_id: sessionUserId,
            cfi_user_id,
            student_name,
            note: note.trim(),
            read: false,
            resolved: false,
            created_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error inserting student note:', insertError);
          return res.status(500).json({ error: 'Failed to submit note' });
        }

        return res.status(200).json({ success: true, notifiedCount: 1 });
      } else {
        // Fallback to existing behavior
        const { data: links, error: linksError } = await supabaseAdmin
          .from('student_links')
          .select('cfi_user_id, student_name')
          .eq('student_user_id', sessionUserId);

        if (linksError) {
          console.error('Error fetching student links for note submit:', linksError);
          return res.status(500).json({ error: 'Database error' });
        }

        if (!links || links.length === 0) {
          return res.status(400).json({ error: 'You are not linked to any instructor yet.' });
        }

        const notesToInsert = links.map((link: any) => ({
          student_user_id: sessionUserId,
          cfi_user_id: link.cfi_user_id,
          student_name: link.student_name,
          note: note.trim(),
          read: false,
          resolved: false,
          created_at: new Date().toISOString()
        }));

        const { error: insertError } = await supabaseAdmin
          .from('student_notes')
          .insert(notesToInsert);

        if (insertError) {
          console.error('Error inserting student notes:', insertError);
          return res.status(500).json({ error: 'Failed to submit note' });
        }

        return res.status(200).json({ success: true, notifiedCount: links.length });
      }
    }

    if (action === 'setActiveView') {
      if (!sessionUserId) {
        return res.status(401).json({ error: 'Unauthorized: Valid session required' });
      }

      const { target } = req.body;
      if (target !== 'student' && target !== 'instructor') {
        return res.status(400).json({ error: 'Invalid target view' });
      }

      const [cfiRes, linksRes, subRes] = await Promise.all([
        supabaseAdmin
          .from('cfi_profile')
          .select('user_id')
          .eq('user_id', sessionUserId)
          .maybeSingle(),
        supabaseAdmin
          .from('student_links')
          .select('id')
          .eq('student_user_id', sessionUserId),
        supabaseAdmin
          .from('user_subscriptions')
          .select('account_type')
          .eq('user_id', sessionUserId)
          .maybeSingle()
      ]);

      if (cfiRes.error) {
        console.error('Error checking cfi_profile:', cfiRes.error);
        return res.status(500).json({ error: 'Database check failed' });
      }
      if (linksRes.error) {
        console.error('Error checking student_links:', linksRes.error);
        return res.status(500).json({ error: 'Database check failed' });
      }
      if (subRes.error) {
        console.error('Error checking user_subscriptions:', subRes.error);
        return res.status(500).json({ error: 'Database check failed' });
      }

      const hasCfiProfile = !!cfiRes.data;
      const holdsStudentRole = Array.isArray(linksRes.data) && linksRes.data.length > 0;
      const currentAccountType = subRes.data?.account_type;

      if (target === 'instructor') {
        const isAllowedCfi = hasCfiProfile || currentAccountType === 'student';
        if (!isAllowedCfi) {
          return res.status(400).json({ error: "You can't switch to the CFI view because you do not have a CFI account." });
        }
      } else if (target === 'student') {
        if (!holdsStudentRole) {
          return res.status(400).json({ error: "You can't switch to the student view because you aren't enrolled as a student with any instructor." });
        }
      }

      const { error: updateError } = await supabaseAdmin
        .from('user_subscriptions')
        .update({ account_type: target })
        .eq('user_id', sessionUserId);

      if (updateError) {
        console.error('Error updating account view:', updateError);
        return res.status(500).json({ error: 'Failed to update account type' });
      }

      return res.status(200).json({ success: true, activeView: target });
    }

    if (action === 'approveProposal') {
      if (!sessionUserId) {
        return res.status(401).json({ error: 'Unauthorized: Valid session required' });
      }

      const { proposal_id } = req.body;
      if (!proposal_id) {
        return res.status(400).json({ error: 'proposal_id is required' });
      }

      const { data: proposal, error: findError } = await supabaseAdmin
        .from('student_profile_proposals')
        .select('*')
        .eq('id', proposal_id)
        .maybeSingle();

      if (findError) {
        console.error('Error fetching proposal:', findError);
        return res.status(500).json({ error: 'Database error' });
      }

      if (!proposal) {
        return res.status(404).json({ error: 'Proposal not found' });
      }

      if (proposal.cfi_user_id !== sessionUserId) {
        return res.status(403).json({ error: 'Forbidden: Only the addressed instructor may approve this proposal' });
      }

      if (proposal.status !== 'pending') {
        return res.status(200).json({
          success: true,
          proposal_id,
          appliedFields: {},
          updatedRecordsCount: 0
        });
      }

      const updateObject: any = {};
      if (proposal.phone !== undefined && proposal.phone !== null && String(proposal.phone).trim() !== '') {
        updateObject.phone = proposal.phone;
      }
      if (proposal.dob !== undefined && proposal.dob !== null && String(proposal.dob).trim() !== '') {
        updateObject.dob = proposal.dob;
      }
      if (proposal.medical_class !== undefined && proposal.medical_class !== null && String(proposal.medical_class).trim() !== '') {
        updateObject.medical_class = proposal.medical_class;
      }
      if (proposal.medical_exam_date !== undefined && proposal.medical_exam_date !== null && String(proposal.medical_exam_date).trim() !== '') {
        updateObject.medical_exam_date = proposal.medical_exam_date;
      }
      if (proposal.student_cert_number !== undefined && proposal.student_cert_number !== null && String(proposal.student_cert_number).trim() !== '') {
        updateObject.student_cert_number = proposal.student_cert_number;
      }

      const { data: links, error: linksError } = await supabaseAdmin
        .from('student_links')
        .select('cfi_user_id, student_name')
        .eq('student_user_id', proposal.student_user_id);

      if (linksError) {
        console.error('Error fetching student links for proposal approval:', linksError);
        return res.status(500).json({ error: 'Failed to look up student links' });
      }

      let updateCount = 0;
      if (links && links.length > 0 && Object.keys(updateObject).length > 0) {
        for (const link of links) {
          const { error: updateError } = await supabaseAdmin
            .from('students')
            .update(updateObject)
            .eq('user_id', link.cfi_user_id)
            .eq('name', link.student_name);

          if (updateError) {
            console.error(`Error updating student record for CFI ${link.cfi_user_id} and student ${link.student_name}:`, updateError);
          } else {
            updateCount++;
          }
        }
      }

      const { error: proposalUpdateError } = await supabaseAdmin
        .from('student_profile_proposals')
        .update({
          status: 'approved',
          resolved_at: new Date().toISOString()
        })
        .eq('id', proposal_id);

      if (proposalUpdateError) {
        console.error('Error updating proposal status to approved:', proposalUpdateError);
        return res.status(500).json({ error: 'Failed to update proposal status' });
      }

      return res.status(200).json({
        success: true,
        proposal_id,
        appliedFields: updateObject,
        updatedRecordsCount: updateCount
      });
    }

    if (action === 'approveLink') {
      if (!sessionUserId) {
        return res.status(401).json({ error: 'Unauthorized: Valid session required' });
      }

      const { link_id } = req.body;
      if (!link_id) {
        return res.status(400).json({ error: 'link_id is required' });
      }

      const { data: link, error: findError } = await supabaseAdmin
        .from('student_links')
        .select('*')
        .eq('id', link_id)
        .maybeSingle();

      if (findError) {
        console.error('Error fetching link:', findError);
        return res.status(500).json({ error: 'Database error' });
      }

      if (!link) {
        return res.status(404).json({ error: 'Link not found' });
      }

      if (link.student_user_id !== sessionUserId) {
        return res.status(403).json({ error: 'Forbidden: A student may only approve their own connection requests' });
      }

      const { error: updateError } = await supabaseAdmin
        .from('student_links')
        .update({ status: 'approved' })
        .eq('id', link_id);

      if (updateError) {
        console.error('Error approving link:', updateError);
        return res.status(500).json({ error: 'Failed to update link status' });
      }

      return res.status(200).json({ success: true });
    }

    // Determine target CFI/student profile based on token vs. authenticated session
    let studentName = '';
    let userId = '';
    let linkedProfiles: any[] = [];
    let studentProfile: any = null;
    let isAuthorized = false;

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

          const match = links.some(
            (link: any) =>
              link.cfi_user_id === userId &&
              link.student_name === studentName
          );
          if (match) {
            isAuthorized = true;
          }
        }
      }
    } else {
      // 4. Add an authenticated data-fetch path (no share token, valid session).
      // Look up all rows in student_links where student_user_id equals the session user id.
      const { data: links, error: linksError } = await supabaseAdmin
        .from('student_links')
        .select('id, status, cfi_user_id, student_name')
        .eq('student_user_id', sessionUserId);

      if (linksError) throw linksError;

      if (!links || links.length === 0) {
        let emptyStudentProfile: any = null;
        if (sessionUserId) {
          const { data: prof, error: profError } = await supabaseAdmin
            .from('student_profiles')
            .select('*')
            .eq('student_user_id', sessionUserId)
            .maybeSingle();
          if (!profError && prof) {
            emptyStudentProfile = prof;
          }
        }
        return res.status(200).json({
          studentName: '',
          userId: '',
          student: null,
          lessons: [],
          manualHours: [],
          endorsements: [],
          scheduledLessons: [],
          linkedProfiles: [],
          studentProfile: emptyStudentProfile
        });
      }

      const cfiUserIds = Array.from(new Set(links.map((link: any) => link.cfi_user_id)));
      const { data: cfiProfiles, error: profilesError } = await supabaseAdmin
        .from('cfi_profile')
        .select('user_id, full_name')
        .in('user_id', cfiUserIds);

      const profileMap: Record<string, string> = {};
      if (!profilesError && cfiProfiles) {
        cfiProfiles.forEach((prof: any) => {
          profileMap[prof.user_id] = prof.full_name || '';
        });
      }

      linkedProfiles = links.map((link: any) => ({
        ...link,
        cfi_name: profileMap[link.cfi_user_id] || ''
      }));

      // Look up student's own profile
      if (sessionUserId) {
        const { data: prof, error: profError } = await supabaseAdmin
          .from('student_profiles')
          .select('*')
          .eq('student_user_id', sessionUserId)
          .maybeSingle();
        if (!profError && prof) {
          studentProfile = prof;
        }
      }

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
      isAuthorized = true;
    }

    // Process actions that use studentName and userId
    if (action === 'requestLesson') {
      if (!isAuthorized) {
        return res.status(403).json({ error: 'Login and active link are required to request a lesson.' });
      }
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
      if (!isAuthorized) {
        return res.status(403).json({ error: 'Login is required to request an export.' });
      }
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
      if (!isAuthorized) {
        return res.status(403).json({ error: 'Login is required to retrieve exports.' });
      }
      const { data, error } = await supabaseAdmin
        .from('student_exports')
        .select('lesson_ids')
        .eq('token', token || '');

      if (error) throw error;
      return res.status(200).json({ exports: data || [] });
    }

    if (action === 'submitTest') {
      if (!isAuthorized) {
        return res.status(403).json({ error: 'Login is required to submit a test.' });
      }
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

    if (!isAuthorized) {
      return res.status(200).json({
        studentName,
        requiresAccount: true,
        lessons: [],
        manualHours: [],
        endorsements: [],
        student: null,
        scheduledLessons: []
      });
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

    if (!token && sessionUserId) {
      responseData.studentProfile = studentProfile || null;
    }

    return res.status(200).json(responseData);

  } catch (err: any) {
    console.error('Error fetching student portal data:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
