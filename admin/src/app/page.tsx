"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        // 已登录，重定向到 dashboard
        router.replace("/projects")
      } else {
        // 未登录，重定向到登录页
        router.replace("/login")
      }
    }
    checkAuth()
  }, [router])

  // 显示加载状态，避免闪烁
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-sm text-gray-500">加载中...</div>
    </div>
  )
}
