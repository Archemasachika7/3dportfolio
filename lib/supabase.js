import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// The anon key is safe for client-side use (it is scoped by Supabase Row
// Level Security policies), but both values still come from env vars
// rather than being hard-coded so the project ref/key can change without
// touching source, and so nothing here is copy-pasteable secret material.
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null
