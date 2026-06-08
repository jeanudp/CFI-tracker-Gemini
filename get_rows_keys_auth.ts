import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nfmzoesbzgqubbeuwetq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mbXpvZXNiemdxdWJiZXV3ZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxODA3OTUsImV4cCI6MjA5MDc1Njc5NX0.YfGo2QCylVF4atDj7PVfiM1BUjLRIT9FQnVHVuxS278';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  try {
    const email = `test.cfi.owner.${Date.now()}@gmail.com`;
    const password = 'test-password-12345';

    console.log("Signing up temporary CFI user...");
    const signup = await supabase.auth.signUp({ email, password });
    if (signup.error) throw signup.error;
    const user = signup.data.user;
    if (!user) throw new Error("No user in signup response");
    console.log("CFI signed up successfully. ID:", user.id);

    console.log("Signing in...");
    const signin = await supabase.auth.signInWithPassword({ email, password });
    if (signin.error) throw signin.error;
    console.log("Signed in successfully!");

    // Set full name in profiles table first
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: 'Test CFI Instructor'
    });
    if (profileError) {
      console.log("Profile upsert warning:", profileError.message);
    }

    console.log("Creating temporary organization...");
    const { data: orgId, error: createOrgError } = await supabase.rpc('create_organization', {
      p_name: 'Auth Test Flight School'
    });
    if (createOrgError) throw createOrgError;
    console.log("Created Org ID:", orgId);

    console.log("Creating students inside organization...");
    const { data: student, error: createStudentError } = await supabase.rpc('create_school_student', {
      p_org_id: orgId,
      p_name: 'Awesome Student Builder',
      p_assigned_cfi: user.id
    });
    if (createStudentError) throw createStudentError;
    console.log("Created Student Object:", student);

    console.log("Listing school students to inspect keys...");
    const { data: students, error: listError } = await supabase.rpc('get_school_students', {
      p_org_id: orgId
    });
    if (listError) throw listError;
    console.log("Listed Students count:", students.length);
    console.log("Student Row Keys and Values:", students[0]);

  } catch (err: any) {
    console.error("Error during authenticated run:", err);
  }
}

test();
