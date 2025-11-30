import { createClient } from "@supabase/supabase-js";

export const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,  // IMPORTANT
  {
    auth: { persistSession: false }
  }
);
