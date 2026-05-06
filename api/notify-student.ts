import type { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export default async function handler(req: Request, res: Response) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { 
    studentName, 
    changeType, 
    originalDate, 
    originalTime, 
    newDate, 
    newTime,
    userId
  } = req.body;

  // Basic validation
  if (!studentName || !changeType || !originalDate || !originalTime || !userId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Formatting helpers
  const formatDate = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      let [hours, minutes] = timeStr.split(':').map(Number);
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    } catch (e) {
      return timeStr;
    }
  };

  // Environment variables
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey || !resendApiKey) {
    console.error('Missing environment variables for notification service');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    // Initialize clients
    // Use service role key to bypass RLS and look up student email
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const resend = new Resend(resendApiKey);

    // 1. Look up student email from students table
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('email_address')
      .eq('name', studentName)
      .single();

    if (studentError || !student?.email_address) {
      console.log(`No email on file for student: ${studentName}`);
      return res.status(200).json({ message: 'No email on file for student' });
    }

    const studentEmail = student.email_address;

    // 2. Look up CFI name for sign-off
    console.log('DEBUG: Looking up CFI name for userId:', userId);
    const { data: cfi, error: cfiError } = await supabase
      .from('cfi_profile')
      .select('name')
      .eq('user_id', userId)
      .single();

    console.log('DEBUG: CFI profile response:', { data: cfi, error: cfiError });

    const cfiName = cfi?.name;
    const signOff = cfiName ? `Your Flight Instructor, ${cfiName}` : 'Your Flight Instructor';

    // 3. Prepare email content
    const subject = "Your lesson has been updated — 61 Tracker";
    const changeVerb = changeType === 'rescheduled' ? 'rescheduled' : 'cancelled';
    
    let detailsHtml = `<p style="margin: 0;">Your lesson originally scheduled for <strong>${formatDate(originalDate)} at ${formatTime(originalTime)}</strong> has been ${changeVerb}.</p>`;

    if (changeType === 'rescheduled' && newDate && newTime) {
      detailsHtml += `<p style="margin: 12px 0 0 0;">The new time is <strong>${formatDate(newDate)} at ${formatTime(newTime)}</strong>.</p>`;
    }

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
    <p style="font-size: 16px; margin-bottom: 16px;">Hi ${studentName},</p>
    <div style="background-color: #F8FAFC; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
      ${detailsHtml}
    </div>
    <p style="font-size: 16px; margin-top: 32px; margin-bottom: 0;">See you soon,</p>
    <p style="font-size: 16px; margin-top: 4px; font-weight: bold;">${signOff}</p>
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #E2E8F0; text-align: center;">
      <p style="font-size: 12px; color: #64748B; margin: 0; font-style: italic;">Sent via 61 Tracker — The modern toolkit for Part 61 CFIs</p>
    </div>
  </div>
  <div style="display: none; font-size: 1px; color: #ffffff; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${Date.now()}
  </div>
</body>
</html>`;

    // 4. Send email via Resend
    const { data: resendData, error: resendError } = await resend.emails.send({
      from: '61 Tracker <noreply@61tracker.com>',
      to: [studentEmail],
      subject: subject,
      html: html,
    });

    if (resendError) {
      console.error('Resend error:', resendError);
      return res.status(500).json({ error: 'Failed to send email via Resend' });
    }

    console.log(`Notification ${changeVerb} sent to ${studentName} (${studentEmail}). ID: ${resendData?.id}`);
    return res.status(200).json({ message: 'Success', id: resendData?.id });

  } catch (err: any) {
    console.error('Notification unexpected error:', err);
    return res.status(500).json({ error: err.message || 'An unexpected error occurred' });
  }
}
