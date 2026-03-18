import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    if (pathname.startsWith("/dashboard/admin") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard/" + token?.role, req.url));
    }

    if (pathname.startsWith("/dashboard/operador") && token?.role !== "operador") {
      return NextResponse.redirect(new URL("/dashboard/" + token?.role, req.url));
    }

    if (pathname.startsWith("/dashboard/cliente") && token?.role !== "cliente") {
      return NextResponse.redirect(new URL("/dashboard/" + token?.role, req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
