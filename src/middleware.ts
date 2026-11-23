import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminJwt } from "./lib/admin-jwt";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/api/admin/auth") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin/")) {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const isValid = await verifyAdminJwt(token);
    if (!isValid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (pathname === "/api" || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (pathname === "/admin/login") {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (await verifyAdminJwt(token)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const isValid = await verifyAdminJwt(token);
    if (!isValid) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!api(?:/|$)|_next|_vercel|.*\\..*).*)",
    "/api/admin/:path*",
  ],
};
