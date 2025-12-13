"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const nav = [
  { href: "/projects", label: "项目管理" },
  { href: "/reviews", label: "评价管理" },
  { href: "/leads", label: "客户需求" },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-64 shrink-0 border-r border-white/10 bg-neutral-950 text-neutral-200">
      <div className="p-6">
        <div className="text-sm font-semibold tracking-widest text-orange-500">
          WEIDU ADMIN
        </div>
        <div className="mt-1 text-xs tracking-wider text-neutral-500">
          维度空间后台管理
        </div>
      </div>
      <nav className="px-3 pb-6">
        {nav.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "block rounded-xl px-4 py-3 text-sm transition-colors",
                active
                  ? "bg-white/10 text-white"
                  : "text-neutral-300 hover:bg-white/5 hover:text-white",
              ].join(" ")}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}


