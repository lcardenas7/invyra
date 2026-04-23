import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { nextUrl } = request;
  const hasOAuthCode = nextUrl.searchParams.has("code");

  if (nextUrl.pathname === "/" && hasOAuthCode) {
    const callbackUrl = nextUrl.clone();
    callbackUrl.pathname = "/auth/callback";
    return NextResponse.redirect(callbackUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
