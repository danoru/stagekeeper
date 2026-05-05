import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE =
  process.env.NODE_ENV === "production"
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";

export function proxy(request: NextRequest) {
  const session = request.cookies.get(SESSION_COOKIE);

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/settings"],
};
