import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname
  
  // 明确识别前台域名
  const isFrontend = hostname.includes('www.105911.xyz') || 
                     hostname === '105911.xyz' ||
                     (hostname.startsWith('105911.xyz') && !hostname.startsWith('admin.'))
  
  // 如果是前台域名，将根路径和 HTML 文件请求重定向到静态文件路由
  if (isFrontend) {
    // 如果是根路径，重写到 /static
    if (pathname === '/') {
      return NextResponse.rewrite(new URL('/static', request.url))
    }
    // 如果是 HTML 文件请求，重写到 /static
    if (pathname.endsWith('.html')) {
      return NextResponse.rewrite(new URL(`/static${pathname}`, request.url))
    }
  }
  
  // 后台域名（admin.105911.xyz）或其他域名正常处理 Next.js 路由
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

