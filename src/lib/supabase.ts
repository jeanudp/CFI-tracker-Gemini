import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://nfmzoesbzgqubbeuwetq.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mbXpvZXNiemdxdWJiZXV3ZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxODA3OTUsImV4cCI6MjA5MDc1Njc5NX0.YfGo2QCylVF4atDj7PVfiM1BUjLRIT9FQnVHVuxS278';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
