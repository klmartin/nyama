import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import createIntlMiddleware from "next-intl/middleware";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "secret123"
);

// next-intl middleware
const intlMiddleware = createIntlMiddleware({
  locales: ["en", "sw"],
  defaultLocale: "sw"
});

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // 1️⃣ Handle language routing FIRST
  const intlResponse = intlMiddleware(req);
  if (intlResponse) return intlResponse;

  // 2️⃣ Protect dashboard routes
  if (pathname.includes("/dashboard")) {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    try {
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch (err) {
      console.log("JWT VERIFY ERROR:", err.message);
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/(en|sw)/:path*",
    "/dashboard/:path*",
    "/(en|sw)/dashboard/:path*"
  ]
};
