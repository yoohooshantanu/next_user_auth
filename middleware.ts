import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req: req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const publicPaths = ["/", "/signup"];
  const isPublicPath = publicPaths.includes(pathname);

  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Allow the request to proceed if it doesn't match any of the above conditions
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/signup", "/dashboard"],
};
