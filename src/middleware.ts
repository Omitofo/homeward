import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session on every matched request so Server
 * Components and Route Handlers always see a valid cookie pair.
 * Also applies lightweight route guards for authenticated areas.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // No Supabase configured — skip auth work (mock mode still works).
  if (!url || !key) {
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // getUser validates the JWT with the Auth server (preferred over getSession).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isProtected =
    pathname.startsWith("/me") ||
    pathname.startsWith("/studio") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/messages");

  if (isProtected && !user) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  // Logged-in users do not need the login/register pages.
  if (
    user &&
    (pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/register/shelter")
  ) {
    const next = request.nextUrl.searchParams.get("next") ?? "/me";
    return NextResponse.redirect(new URL(next, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except static assets and Next internals.
     * Auth callback must still run so cookies can be set.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
