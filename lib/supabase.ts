import { createClient } from "@supabase/supabase-js";
import { mustEnv } from "./env";

// Server-side (uses service role key) for secure DB writes/reads
export function supabaseAdmin() {
  return createClient(
    mustEnv("SUPABASE_URL"),
    mustEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } }
  );
}

// Client-side (anon) if you want to read public profile pages later
export function supabaseAnon() {
  return createClient(
    mustEnv("NEXT_PUBLIC_SUPABASE_URL"),
    mustEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  );
}
