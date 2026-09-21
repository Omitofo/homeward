import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ensureShelterProfile } from "@/features/auth/promote-shelter";
import { AUTH_NEXT_COOKIE } from "@/features/auth/constants";

function safeNext(path: string | null | undefined): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/me";
  }
  return path;
}

/**
 * Supabase email magic-link lands here with ?code=…
 * Return path comes from a short-lived cookie (set when the OTP was requested),
 * with ?next= as a fallback for older links.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(
    request.cookies.get(AUTH_NEXT_COOKIE)?.value ?? searchParams.get("next"),
  );

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.redirect(`${origin}/login?error=not_configured`);
  }

  let response = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.redirect(`${origin}${next}`);
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error("[auth/callback] exchange failed", error?.message);
    return NextResponse.redirect(`${origin}/login?error=auth_callback`);
  }

  try {
    await ensureShelterProfile(data.user.id, data.user.user_metadata ?? {});
  } catch (e) {
    console.error("[auth/callback] ensureShelterProfile", e);
  }

  response.cookies.set(AUTH_NEXT_COOKIE, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  return response;
}
