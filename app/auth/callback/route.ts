import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

// Lands every Supabase email link: signup confirmation, password recovery.
// Exchanges the code for a session (sets cookies), then forwards to `next`.
// Failures go back to /login with a human message instead of a dead end.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const dest = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  if (code) {
    const supabase = supabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${dest}`);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("That link expired or was already used — sign in, or request a new one.")}`
    );
  }

  // Supabase reports link errors (expired OTP etc.) as query params.
  const desc = searchParams.get("error_description");
  return NextResponse.redirect(
    `${origin}/login${desc ? `?error=${encodeURIComponent(desc)}` : ""}`
  );
}
