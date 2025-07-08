
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://upibngrkduyxizapnron.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwaWJuZ3JrZHV5eGl6YXBucm9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NTgwNzgsImV4cCI6MjA2NzAzNDA3OH0.byAHgjzOyBSNDHVMtPn17izKudR_Z5ErAH-rTa20LdI";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});