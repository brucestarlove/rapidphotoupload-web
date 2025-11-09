import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Since we're using localStorage (client-side), proxy can't check auth
  // Client-side components will handle redirects
  // This proxy is kept for future cookie-based auth or other server-side checks
  
  // Allow all requests - auth is handled client-side
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

