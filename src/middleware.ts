import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("session_token")?.value;
  const role = request.cookies.get("user_role")?.value;

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

    if (pathname === "/" && role === "Admin") {
      return NextResponse.redirect(new URL("/admindashboard", request.url));
    }

    if (pathname === "/" && role === "Lender") {
      return NextResponse.redirect(new URL("/lenderdashboard", request.url));
    }

    if (pathname === "/" && role === "Borrower") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (pathname.startsWith("/admindashboard") && role !== "Admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (pathname.startsWith("/lenderdashboard") && role !== "Lender") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (pathname.startsWith("/dashboard") && role !== "Borrower") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|static|favicon.ico).*)"],
};
