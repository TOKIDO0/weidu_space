import { NextRequest, NextResponse } from "next/server"
import { readFileSync, existsSync } from "fs"
import { join } from "path"

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // #region agent log
  const logData = { location: 'middleware.ts:8', message: 'Middleware called', data: { pathname }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }
  fetch('http://127.0.0.1:7242/ingest/884a451f-c414-4281-8ea5-65c9af9f4af5', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(logData) }).catch(() => {})
  // #endregion
  
  // 跳过API路由、Next.js内部路由和后台管理路由
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/setup') ||
    pathname.startsWith('/leads') ||
    pathname.startsWith('/projects') ||
    pathname.startsWith('/reviews') ||
    pathname.startsWith('/schedule') ||
    pathname.startsWith('/project-progress')
  ) {
    // #region agent log
    const logData2 = { location: 'middleware.ts:22', message: 'Skipping route', data: { pathname }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }
    fetch('http://127.0.0.1:7242/ingest/884a451f-c414-4281-8ea5-65c9af9f4af5', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(logData2) }).catch(() => {})
    // #endregion
    return NextResponse.next()
  }
  
  // 只处理根路径或HTML文件请求
  let fileName: string
  if (pathname === '/') {
    fileName = 'index.html'
  } else if (pathname.endsWith('.html')) {
    fileName = pathname.slice(1) // 移除前导斜杠
  } else {
    // 如果不是HTML文件，继续正常处理
    return NextResponse.next()
  }
  
  const filePath = join(process.cwd(), 'public', fileName)
  // #region agent log
  const logData3 = { location: 'middleware.ts:40', message: 'Checking file', data: { fileName, filePath, exists: existsSync(filePath) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }
  fetch('http://127.0.0.1:7242/ingest/884a451f-c414-4281-8ea5-65c9af9f4af5', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(logData3) }).catch(() => {})
  // #endregion
  
  if (existsSync(filePath)) {
    try {
      const fileContent = readFileSync(filePath, 'utf-8')
      // #region agent log
      const logData4 = { location: 'middleware.ts:46', message: 'File read successfully', data: { fileName, contentLength: fileContent.length }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }
      fetch('http://127.0.0.1:7242/ingest/884a451f-c414-4281-8ea5-65c9af9f4af5', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(logData4) }).catch(() => {})
      // #endregion
      return new NextResponse(fileContent, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      })
    } catch (error) {
      // #region agent log
      const logData5 = { location: 'middleware.ts:55', message: 'Error reading file', data: { error: String(error), fileName }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }
      fetch('http://127.0.0.1:7242/ingest/884a451f-c414-4281-8ea5-65c9af9f4af5', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(logData5) }).catch(() => {})
      // #endregion
      console.error('Error reading file:', error)
      return NextResponse.next()
    }
  }
  
  // 如果文件不存在，继续正常处理
  // #region agent log
  const logData6 = { location: 'middleware.ts:64', message: 'File not found, continuing', data: { fileName, filePath }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }
  fetch('http://127.0.0.1:7242/ingest/884a451f-c414-4281-8ea5-65c9af9f4af5', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(logData6) }).catch(() => {})
  // #endregion
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，除了：
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

