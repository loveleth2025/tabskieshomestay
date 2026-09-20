import { NextRequest, NextResponse } from "next/server";

// Gates the internal dashboard (/admin/*) and its API routes with HTTP
// Basic Auth. This is a lightweight first pass appropriate for a small,
// single-operator tool — set ADMIN_USERNAME / ADMIN_PASSWORD in your
// environment (Vercel Project Settings → Environment Variables). If you
// later add staff accounts or need audit logs, swap this for real
// authentication (e.g. NextAuth) without changing the pages themselves.
export function middleware(request: NextRequest) {
  const expectedPassword = process.env.ADMIN_PASSWORD;
  const expectedUser = process.env.ADMIN_USERNAME || "tabskies";

  if (!expectedPassword) {
    return new NextResponse(
      "The internal dashboard is not configured. Set ADMIN_PASSWORD in your environment.",
      { status: 503 }
    );
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Basic ")) {
    const decoded = Buffer.from(authHeader.slice(6), "base64").toString("utf-8");
    const separatorIndex = decoded.indexOf(":");
    const user = decoded.slice(0, separatorIndex);
    const pass = decoded.slice(separatorIndex + 1);
    if (user === expectedUser && pass === expectedPassword) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Tabskies Admin"' },
  });
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
