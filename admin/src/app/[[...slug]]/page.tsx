import { NextRequest, NextResponse } from "next/server"
import { readFileSync, existsSync } from "fs"
import { join } from "path"

// 处理静态HTML文件的请求
export default async function StaticPage(
  request: NextRequest,
  { params }: { params: { slug?: string[] } }
) {
  const pathname = request.nextUrl.pathname
  
  // 如果是API路由，返回404让Next.js处理
  if (pathname.startsWith('/api/')) {
    return new NextResponse(null, { status: 404 })
  }
  
  // 如果是已知的后台管理路由，返回404让Next.js处理
  const adminRoutes = ['/login', '/setup', '/leads', '/projects', '/reviews', '/schedule', '/project-progress']
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    return new NextResponse(null, { status: 404 })
  }
  
  // 只处理根路径或HTML文件请求
  let fileName: string
  if (pathname === '/') {
    fileName = 'index.html'
  } else if (pathname.endsWith('.html')) {
    fileName = pathname.slice(1) // 移除前导斜杠
  } else {
    // 如果不是HTML文件，返回404
    return new NextResponse(null, { status: 404 })
  }
  
  const filePath = join(process.cwd(), 'public', fileName)
  
  if (existsSync(filePath)) {
    try {
      const fileContent = readFileSync(filePath, 'utf-8')
      return new NextResponse(fileContent, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      })
    } catch (error) {
      console.error('Error reading file:', error)
      return new NextResponse(null, { status: 500 })
    }
  }
  
  // 如果文件不存在，返回404
  return new NextResponse(null, { status: 404 })
}

