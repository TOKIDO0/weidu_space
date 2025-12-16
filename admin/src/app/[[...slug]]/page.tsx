import { NextRequest, NextResponse } from "next/server"
import { readFileSync, existsSync } from "fs"
import { join } from "path"

// 处理静态HTML文件的请求（仅在生产环境）
export default async function StaticPage(request: NextRequest) {
  // 只处理HTML文件请求和根路径
  const pathname = request.nextUrl.pathname
  
  // 如果是API路由，跳过
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }
  
  // 如果是后台管理路由，跳过
  if (pathname.startsWith('/login') || 
      pathname.startsWith('/setup') || 
      pathname.startsWith('/leads') ||
      pathname.startsWith('/projects') ||
      pathname.startsWith('/reviews') ||
      pathname.startsWith('/schedule') ||
      pathname.startsWith('/project-progress')) {
    return NextResponse.next()
  }
  
  // 处理HTML文件请求
  const fileName = pathname === '/' ? 'index.html' : pathname.endsWith('.html') ? pathname.slice(1) : `${pathname}.html`
  const filePath = join(process.cwd(), 'public', fileName)
  
  if (existsSync(filePath)) {
    try {
      const fileContent = readFileSync(filePath, 'utf-8')
      return new NextResponse(fileContent, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      })
    } catch (error) {
      console.error('Error reading file:', error)
    }
  }
  
  // 如果文件不存在，继续Next.js的正常路由处理
  return NextResponse.next()
}

