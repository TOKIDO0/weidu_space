import { createClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // 这里抛错是为了让你在本地/部署时第一时间发现没配环境变量
  throw new Error(
    "缺少 Supabase 环境变量：请在 admin 项目里配置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY",
  )
}

export const supabase = createClient(url, anonKey)


