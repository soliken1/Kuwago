import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("session_token")?.value;
  const { pathname } = request.nextUrl;

  // Allow public and static routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgotPassword") ||
    pathname.startsWith("/proxy")
  ) {
    return NextResponse.next();
  }

  // Redirect if no token on protected routes
  if (!token && pathname !== "/") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (token) {
    try {
      const checkRes = await fetch(
        "http://kuwagoapi.somee.com/api/Auth/CheckTokenStatus",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await checkRes.json();
      if (!checkRes.status || data.statusCode !== 200) {
        const res = NextResponse.redirect(new URL("/", request.url));
        res.cookies.delete("session_token");
        return res;
      }
    } catch (error) {
      console.error("Token check failed:", error);
      const res = NextResponse.redirect(new URL("/", request.url));
      res.cookies.delete("session_token");
      return res;
    }

    // Redirect from `/` to `/dashboard` if authenticated
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|static|favicon.ico).*)"],
};
