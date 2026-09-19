// Server-only Supabase client using the secret key.
// NEVER import this from a client component.
if (typeof window !== "undefined") {
  throw new Error("supabaseAdmin must only be used on the server");
}

import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);