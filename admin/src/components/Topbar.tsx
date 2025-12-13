"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

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
    <header className="flex items-center justify-between gap-4 border-b border-white/10 bg-neutral-950 px-6 py-4 text-neutral-200">
      <div className="text-sm text-neutral-400">
        <span className="text-white">后台</span> / 数据管理
      </div>
      <div className="flex items-center gap-3">
        {email ? (
          <div className="hidden text-xs text-neutral-400 md:block">{email}</div>
        ) : null}
        <button
          type="button"
          onClick={onLogout}
          className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-neutral-200 transition hover:bg-white/10"
        >
          退出登录
        </button>
      </div>
    </header>
  )
}


