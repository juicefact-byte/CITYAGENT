import { createClient } from '@supabase/supabase-js';

// Browser client — anon key only, RLS enforced by Postgres.
export const supabaseBrowser = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
