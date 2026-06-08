import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nfmzoesbzgqubbeuwetq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mbXpvZXNiemdxdWJiZXV3ZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxODA3OTUsImV4cCI6MjA5MDc1Njc5NX0.YfGo2QCylVF4atDj7PVfiM1BUjLRIT9FQnVHVuxS278';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  try {
    // 1. Get an existing org
    const { data: orgs, error: orgError } = await supabase.from('organizations').select('*').limit(1);
    if (orgError) throw orgError;
    if (!orgs || orgs.length === 0) {
      console.log("No organizations found, cannot test keys with rows.");
      return;
    }
    const orgId = orgs[0].id;
    console.log("Found Org ID:", orgId);

    // 2. Create student
    const studentName = "KeyTest Student " + Date.now();
    const { data: newStudent, error: createError } = await supabase.rpc('create_school_student', {
      p_org_id: orgId,
      p_name: studentName
    });
    if (createError) throw createError;
    console.log("Created Student Row:", newStudent);

    // 3. Get students
    const { data: students, error: listError } = await supabase.rpc('get_school_students', {
      p_org_id: orgId
    });
    if (listError) throw listError;
    console.log("Listing School Students:");
    const matched = students.find((s: any) => s.name === studentName);
    console.log("Matched Student Keys and Values:", matched);

    // Wait, let's also test setting student assignment
    if (matched) {
      console.log("Testing set_student_assignment with null cfi...");
      const { data: assigned, error: assignError } = await supabase.rpc('set_student_assignment', {
        p_student_id: matched.id,
        p_assigned_cfi: null
      });
      console.log("Assignment Edit Output:", assignError ? assignError.message : "Success!", assigned);
    }
  } catch (err: any) {
    console.error("Error during test run:", err);
  }
}

test();
