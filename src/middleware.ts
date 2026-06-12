// src/middleware.ts
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  // 1. 定义需要保护的业务路由
  const protectedRoutes = ["/alerts", "/detective"];
  const isProtectedRoute = protectedRoutes.some((route) => 
    req.nextUrl.pathname.startsWith(route)
  );

  // 2. 如果是业务页且没登录，重定向到登录页
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

// 3. 配置拦截范围
export const config = {
  matcher: ["/alerts/:path*", "/detective/:path*"],
};