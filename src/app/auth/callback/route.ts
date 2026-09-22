import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import {
  ensureShelterProfile,
  type ShelterIntentPayload,
} from "@/features/auth/promote-shelter";
import {
  AUTH_NEXT_COOKIE,
  AUTH_SHELTER_INTENT_COOKIE,
} from "@/features/auth/constants";

function safeNext(path: string | null | undefined): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/me";
  }
  return path;
}

function parseShelterIntentCookie(
  raw: string | undefined,
): ShelterIntentPayload | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof (parsed as ShelterIntentPayload).handle === "string" &&
      typeof (parsed as ShelterIntentPayload).orgName === "string"
    ) {
      const p = parsed as ShelterIntentPayload;
      return {
        handle: p.handle,
        orgName: p.orgName,
        displayName:
          typeof p.displayName === "string" ? p.displayName : undefined,
      };
    }
  } catch {
    // ignore malformed cookie
  }
  return null;
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
  const shelterIntent = parseShelterIntentCookie(
    request.cookies.get(AUTH_SHELTER_INTENT_COOKIE)?.value,
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
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
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

  const promote = await ensureShelterProfile(
    data.user.id,
    data.user.user_metadata ?? {},
    shelterIntent,
  );

  if (!promote.ok) {
    console.error("[auth/callback] ensureShelterProfile", promote.error);
    // Still signed in — send them somewhere useful with a visible error flag
    response = NextResponse.redirect(
      `${origin}/login?error=shelter_promote&detail=${encodeURIComponent(promote.error)}`,
    );
    // Session cookies were already set on the previous response object via setAll;
    // copy any supabase cookies that were set on the request.
    const all = request.cookies.getAll();
    for (const c of all) {
      if (c.name.startsWith("sb-")) {
        response.cookies.set(c.name, c.value, {
          path: "/",
          sameSite: "lax",
          httpOnly: true,
        });
      }
    }
  }

  response.cookies.set(AUTH_NEXT_COOKIE, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  response.cookies.set(AUTH_SHELTER_INTENT_COOKIE, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  return response;
}
