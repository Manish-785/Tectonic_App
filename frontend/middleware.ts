import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE = "tectonic_admin_key";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register")) {
    return NextResponse.redirect(new URL("/catalogue", request.url));
  }

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const expectedKey = process.env.ADMIN_ACCESS_KEY || "tectonic-admin";
  const queryKey = searchParams.get("key");
  const cookieKey = request.cookies.get(ADMIN_COOKIE)?.value;

  // Allow admins to authenticate once via /admin/...?...key=<ADMIN_ACCESS_KEY>.
  if (queryKey && queryKey === expectedKey) {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.searchParams.delete("key");

    const response = NextResponse.redirect(cleanUrl);
    response.cookies.set(ADMIN_COOKIE, expectedKey, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    return response;
  }

  if (cookieKey !== expectedKey) {
    return NextResponse.redirect(new URL("/catalogue", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/auth/login", "/auth/register"],
};
