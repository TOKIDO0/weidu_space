"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { LogOut } from "lucide-react"

export function Topbar() {
  const router = useRouter()
  const [email, setEmail] = useState<string>("")

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? "")
    })
  }, [])

  async function onLogout() {
    await supabase.auth.signOut()
    router.replace("/login")
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="text-sm text-gray-600">
        <span className="text-gray-900 font-medium">后台</span>
        <span className="mx-2">/</span>
        <span>数据管理</span>
      </div>
      <div className="flex items-center gap-4">
        {email && (
          <div className="hidden text-sm text-gray-600 md:block">{email}</div>
        )}
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>退出登录</span>
        </button>
      </div>
    </header>
  )
}
