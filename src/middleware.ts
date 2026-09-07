import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-jwt-key-universitas-sarpras-2026"
);

const COOKIE_NAME = "univ_sarpras_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(COOKIE_NAME)?.value;
  let session: { userId: string; role: string; email: string } | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      session = payload as any;
    } catch {
      session = null;
    }
  }

  // If visiting root "/"
  if (pathname === "/") {
    if (session) {
      if (session.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      } else {
        return NextResponse.redirect(new URL("/dosen/dashboard", request.url));
      }
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If visiting /login while logged in
  if (pathname === "/login") {
    if (session) {
      if (session.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      } else {
        return NextResponse.redirect(new URL("/dosen/dashboard", request.url));
      }
    }
    return NextResponse.next();
  }

  // Admin routes protection
  if (pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dosen/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Dosen routes protection
  if (pathname.startsWith("/dosen")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== "DOSEN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/admin/:path*", "/dosen/:path*"],
};
