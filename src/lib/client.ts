
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://wausvnxwmdnymlsihbov.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhdXN2bnh3bWRueW1sc2loYm92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5OTMwMjYsImV4cCI6MjA2NzU2OTAyNn0.asC14UBknD2enXlhxe5TvuXa9BhKedonXpq5DVonvxI";


export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== "undefined" ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
});