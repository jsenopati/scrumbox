import { NextResponse, type NextRequest } from "next/server"

const SESSION_COOKIE = "scrumbox_session"

// Coarse gate: redirect visitors with no session cookie back to the login page.
// Authoritative role enforcement happens in each page via requireRole().
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE)

  if (!hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/manage/:path*"],
}
