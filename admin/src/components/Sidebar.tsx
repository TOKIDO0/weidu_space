"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
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
  MessageCircle,
  Moon,
  Sun,
  Menu,
  X
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

export function Sidebar({ isOpen, onClose, onChatOpen }: { isOpen?: boolean; onClose?: () => void; onChatOpen?: () => void }) {
  const pathname = usePathname()
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // 从localStorage读取主题设置（参考 darkmode-switch 的实现）
    const savedDarkmode = localStorage.getItem("darkmode")
    const savedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const shouldBeDark = savedDarkmode === "active" || savedTheme === "dark" || (!savedTheme && !savedDarkmode && prefersDark)
    
    setIsDark(shouldBeDark)
    updateTheme(shouldBeDark)
  }, [])

  function updateTheme(dark: boolean) {
    if (dark) {
      document.documentElement.classList.add("dark")
      document.body.classList.add("darkmode")
      localStorage.setItem("theme", "dark")
      localStorage.setItem("darkmode", "active")
    } else {
      document.documentElement.classList.remove("dark")
      document.body.classList.remove("darkmode")
      localStorage.setItem("theme", "light")
      localStorage.setItem("darkmode", null)
    }
  }

  function toggleTheme() {
    const newTheme = !isDark
    setIsDark(newTheme)
    updateTheme(newTheme)
  }
  
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 
        flex-col h-screen
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:flex
      `}>
      {/* Logo Section */}
      <div className="p-4 sm:p-6 pb-4">
        <div className="flex items-center justify-between mb-3 lg:justify-center">
          <div className="flex items-center justify-center flex-1">
            <img 
              src={isDark ? "https://dl2.img.timecdn.cn/2025/12/14/LOGO.png" : "https://dl.img.timecdn.cn/2025/12/14/LOGO.png"} 
              alt="LOGO" 
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
            />
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <div className="text-center">
          <h1 className="text-base sm:text-lg font-serif text-gray-800 dark:text-white">维度空间</h1>
          <p className="text-[10px] sm:text-xs text-purple-500 dark:text-purple-400 mt-1">后台管理系统</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 sm:px-3 pb-4 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.title} className="mb-4 sm:mb-6">
            <div className="px-2 sm:px-3 mb-2">
              <h2 className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
                    onClick={() => {
                      // 移动端点击链接后关闭侧边栏
                      if (onClose && window.innerWidth < 1024) {
                        onClose()
                      }
                    }}
                    className={`
                      flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-colors
                      ${
                        active
                          ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Theme Toggle */}
      <div className="p-2 sm:p-3 pb-2 sm:pb-3">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {isDark ? (
            <>
              <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>浅色模式</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>深色模式</span>
            </>
          )}
        </button>
      </div>

      {/* Help Widget */}
      <div className="p-2 sm:p-3 pb-4 sm:pb-6">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shrink-0">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-white mb-1">需要帮助？</h3>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">与我们的 AI 助手聊天</p>
            </div>
          </div>
          <button 
            onClick={() => onChatOpen?.()}
            className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs sm:text-sm font-medium py-1.5 sm:py-2 px-3 sm:px-4 hover:opacity-90 transition-opacity"
          >
            打开聊天
          </button>
        </div>
      </div>
      
    </aside>
    </>
  )
}
