"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  CalendarDays, 
  BookOpen, 
  Heart, 
  MessageSquare,
  Video,
  Share2,
  UserCog,
  Building2,
  UsersRound,
  MessageCircle
} from "lucide-react"

const navSections = [
  {
    title: "内容管理",
    items: [
      { href: "/", label: "概览", icon: LayoutDashboard },
      { href: "/projects", label: "项目管理", icon: BookOpen },
      { href: "/reviews", label: "评价管理", icon: MessageSquare },
      { href: "/leads", label: "客户需求", icon: Users },
      { href: "/schedule", label: "日程", icon: Calendar },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  
  return (
    <aside className="w-64 shrink-0 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Logo Section */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-center mb-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-lg font-serif text-gray-800">维度空间</h1>
          <p className="text-xs text-purple-500 mt-1">后台管理系统</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pb-4 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.title} className="mb-6">
            <div className="px-3 mb-2">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {section.title}
              </h2>
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon
                const isRoot = item.href === "/"
                const active = isRoot 
                  ? pathname === "/" || pathname === ""
                  : pathname === item.href || pathname?.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                      ${
                        active
                          ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Help Widget */}
      <div className="p-3 pb-6">
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">需要帮助？</h3>
              <p className="text-xs text-gray-500">与我们的 AI 助手聊天</p>
            </div>
          </div>
          <button className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium py-2 px-4 hover:opacity-90 transition-opacity">
            打开聊天
          </button>
        </div>
      </div>
    </aside>
  )
}
