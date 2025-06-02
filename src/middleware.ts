import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(request: NextRequest) {
  const session_token = request.cookies.get("session_token")?.value;
  const { pathname } = request.nextUrl;

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

  if (session_token && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!session_token && pathname !== "/") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|static|favicon.ico).*)"],
};
