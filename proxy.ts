import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "session";

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/notifications"];

// Routes that require Faculty role
const facultyOnlyRoutes = ["/dashboard"];

// Routes that should redirect to home if already logged in
const authRoutes = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

  // Check if user has a session
  const isAuthenticated = !!sessionCookie?.value;
  let userRole: string | null = null;

  if (isAuthenticated && sessionCookie?.value) {
    try {
      const sessionData = Buffer.from(sessionCookie.value, "base64").toString(
        "utf-8"
      );
      const session = JSON.parse(sessionData);
      userRole = session.role;
    } catch {
      // Invalid session, treat as unauthenticated
    }
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && authRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Check protected routes
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check faculty-only routes
    if (
      facultyOnlyRoutes.some((route) => pathname.startsWith(route)) &&
      userRole !== "Faculty"
    ) {
      // Non-faculty users cannot access dashboard
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (they handle their own auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
