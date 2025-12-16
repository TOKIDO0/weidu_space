import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  
  // 如果是前台域名（www.105911.xyz），将根路径重定向到静态文件
  if (hostname.includes('www.105911.xyz') || hostname === '105911.xyz') {
    // 如果是根路径，重定向到 /static
    if (request.nextUrl.pathname === '/') {
      return NextResponse.rewrite(new URL('/static', request.url))
    }
    // 如果是 HTML 文件请求，重定向到 /static
    if (request.nextUrl.pathname.endsWith('.html')) {
      return NextResponse.rewrite(new URL(`/static${request.nextUrl.pathname}`, request.url))
    }
  }
  
  // 后台域名（admin.105911.xyz）正常处理 Next.js 路由
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径除了：
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

