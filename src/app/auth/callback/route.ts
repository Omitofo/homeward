import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ensureShelterProfile } from "@/features/auth/actions";

function safeNext(path: string | null): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/me";
  }
  return path;
}

/**
 * Supabase email magic-link lands here with ?code=…
 * Exchange the code for a session, optionally promote shelter accounts,
 * then redirect to the intended page.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

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

  // Shelter sign-up metadata → promote role + create shelters row.
  // Uses admin client; does not depend on the new cookies being readable yet.
  try {
    await ensureShelterProfile(data.user.id, data.user.user_metadata ?? {});
  } catch (e) {
    console.error("[auth/callback] ensureShelterProfile", e);
  }

  return response;
}
