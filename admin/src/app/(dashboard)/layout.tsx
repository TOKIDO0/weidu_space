"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Sidebar } from "@/components/Sidebar"
import { Topbar } from "@/components/Topbar"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const checkingRef = useRef(false)

  useEffect(() => {
    let mounted = true
    
    async function checkAuth() {
      // 防止重复检查
      if (checkingRef.current) return
      checkingRef.current = true

      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (!mounted) return

        if (error) {
          console.error("Session check error:", error)
          checkingRef.current = false
          router.replace("/login")
          return
        }

        if (!data.session) {
          checkingRef.current = false
          router.replace("/login")
          return
        }

        // 有 session，设置 ready
        setReady(true)
        checkingRef.current = false
      } catch (err) {
        console.error("Auth check failed:", err)
        if (mounted) {
          checkingRef.current = false
          router.replace("/login")
        }
      }
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      
      if (!session) {
        setReady(false)
        checkingRef.current = false
        router.replace("/login")
      } else if (!ready) {
        setReady(true)
        checkingRef.current = false
      }
    })

    return () => {
      mounted = false
      checkingRef.current = false
      subscription.unsubscribe()
    }
  }, [router, ready])

  if (!ready) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center">
        <div className="text-sm text-gray-500">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}


