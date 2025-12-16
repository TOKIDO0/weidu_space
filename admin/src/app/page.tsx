"use client"

// 根路径页面 - 直接使用 dashboard 页面
// 由于路由组 (dashboard) 不会影响 URL，我们需要明确创建根路径页面
import DashboardHome from './(dashboard)/page'

export default function HomePage() {
  return <DashboardHome />
}

