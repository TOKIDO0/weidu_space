"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

  async function onLogin(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    router.replace("/projects")
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <div className="text-xs tracking-[0.35em] text-orange-500">
          WEIDU ADMIN
        </div>
        <h1 className="mt-3 text-2xl font-semibold text-white">登录后台</h1>
        <p className="mt-2 text-sm text-neutral-400">
          使用 Supabase Auth 的邮箱/密码登录。
        </p>

        <form className="mt-8 space-y-4" onSubmit={onLogin}>
          <div>
            <label className="block text-xs text-neutral-400 mb-2">邮箱</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="w-full rounded-2xl border border-white/10 bg-neutral-950 px-4 py-3 text-sm outline-none focus:border-orange-500"
              placeholder="admin@weidu.com"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-400 mb-2">密码</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="w-full rounded-2xl border border-white/10 bg-neutral-950 px-4 py-3 text-sm outline-none focus:border-orange-500"
              placeholder="••••••••"
            />
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <button
            disabled={loading}
            className="w-full rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
            type="submit"
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </form>

        <div className="mt-6 text-xs text-neutral-500 leading-relaxed">
          第一次使用：先在 Supabase 控制台创建一个管理员用户（Auth → Users）。
        </div>
      </div>
    </div>
  )
}


