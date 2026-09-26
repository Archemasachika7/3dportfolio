import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

/**
 * Called by the admin after every save, so changes show on the site right
 * away instead of after the 60-second cache. The admin sends its signed-in
 * user's access token; the token is checked with Supabase Auth, so no
 * extra shared secret is needed. Public sign-ups are off, so a valid user
 * is the admin.
 */
export async function POST(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const token = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "")
  if (!url || !key || !token) {
    return NextResponse.json({ revalidated: false, error: "unauthorized" }, { status: 401 })
  }

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data?.user) {
    return NextResponse.json({ revalidated: false, error: "unauthorized" }, { status: 401 })
  }

  // Every page reads from Supabase, so refresh the whole site.
  revalidatePath("/", "layout")
  return NextResponse.json({ revalidated: true, at: new Date().toISOString() })
}
