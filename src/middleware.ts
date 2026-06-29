import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const secret = process.env.AUTH_SECRET;
  // secret이 없으면 절대 통과시키지 않음 (설정 누락 시 잠금)
  const authed = !!secret && req.cookies.get(SESSION_COOKIE)?.value === secret;

  if (pathname === "/login") {
    return authed ? NextResponse.redirect(new URL("/", req.url)) : NextResponse.next();
  }

  if (!authed) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // 정적 자산은 제외하고 나머지(페이지 + /api/*)에 적용
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
