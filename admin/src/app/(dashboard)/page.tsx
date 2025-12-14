"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Heart, 
  Clock, 
  TrendingUp,
  BookOpen,
  MessageSquare,
  ArrowUpRight
} from "lucide-react"
import Link from "next/link"

export default function DashboardHome() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalLeads: 0,
    totalReviews: 0,
    activeLeads: 0,
    newProjectsThisMonth: 0,
    newLeadsThisWeek: 0,
  })
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    
    try {
      // 获取当前时间范围
      const now = new Date()
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const thisWeekStart = new Date(now)
      thisWeekStart.setDate(now.getDate() - 7)

      // Load projects
      const { data: projects } = await supabase
        .from("projects")
        .select("id, title, created_at, published")
        .order("created_at", { ascending: false })
        .limit(5)

      // Load leads
      const { data: leads } = await supabase
        .from("leads")
        .select("id, name, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5)

      // Load reviews
      const { data: reviews } = await supabase
        .from("reviews")
        .select("id, name, created_at, approved")
        .order("created_at", { ascending: false })
        .limit(5)

      // Calculate stats
      const { count: projectsCount } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })

      const { count: leadsCount } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })

      const { count: reviewsCount } = await supabase
        .from("reviews")
        .select("*", { count: "exact", head: true })

      const { count: activeLeadsCount } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("status", "new")

      // 本月新增项目
      const { count: newProjectsThisMonth } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .gte("created_at", thisMonthStart.toISOString())

      // 本周新增需求
      const { count: newLeadsThisWeek } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .gte("created_at", thisWeekStart.toISOString())

      setStats({
        totalProjects: projectsCount || 0,
        totalLeads: leadsCount || 0,
        totalReviews: reviewsCount || 0,
        activeLeads: activeLeadsCount || 0,
        newProjectsThisMonth: newProjectsThisMonth || 0,
        newLeadsThisWeek: newLeadsThisWeek || 0,
      })

      // Combine activities
      const activities: any[] = []
      
      projects?.forEach((p) => {
        activities.push({
          type: "project",
          label: "新项目",
          text: `${p.title} ${p.published ? "已发布" : "已创建"}`,
          time: p.created_at,
          color: "green",
        })
      })

      leads?.forEach((l) => {
        activities.push({
          type: "lead",
          label: "客户需求",
          text: `${l.name} 提交了新需求`,
          time: l.created_at,
          color: "blue",
        })
      })

      reviews?.forEach((r) => {
        activities.push({
          type: "review",
          label: "评价",
          text: `${r.name || "匿名"} 提交了评价`,
          time: r.created_at,
          color: "orange",
        })
      })

      activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      setRecentActivities(activities.slice(0, 4))
    } catch (error) {
      console.error("加载数据失败:", error)
    } finally {
      setLoading(false)
    }
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} 天前`
    if (hours > 0) return `${hours} 小时前`
    const minutes = Math.floor(diff / (1000 * 60))
    if (minutes > 0) return `${minutes} 分钟前`
    return "刚刚"
  }

  const goalProgress = stats.totalProjects > 0 
    ? Math.min(100, (stats.totalProjects / (stats.totalProjects + 5)) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">仪表盘概览</h1>
        <p className="text-sm text-gray-600 mt-1">
          欢迎回来！这是维度空间后台的概览信息。
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projects */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {loading ? "..." : stats.totalProjects}
          </div>
          <div className="text-sm text-gray-700 font-medium mb-1">总项目数</div>
          <div className="text-xs text-purple-600 font-medium">
            +{stats.newProjectsThisMonth} 本月新增
          </div>
        </div>

        {/* Total Leads */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {loading ? "..." : stats.totalLeads}
          </div>
          <div className="text-sm text-gray-600 font-medium mb-1">客户需求总数</div>
          <div className="text-xs text-blue-600 font-medium">
            +{stats.newLeadsThisWeek} 本周新增
          </div>
        </div>

        {/* Total Reviews */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {loading ? "..." : stats.totalReviews}
          </div>
          <div className="text-sm text-gray-600 font-medium mb-1">评价总数</div>
          <div className="text-xs text-green-600 font-medium">较上月增长</div>
        </div>

        {/* Active Leads */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <Heart className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {loading ? "..." : stats.activeLeads}
          </div>
          <div className="text-sm text-gray-600 font-medium mb-1">待处理需求</div>
          <div className="text-xs text-orange-600 font-medium">本周已处理</div>
        </div>
      </div>

      {/* Recent Activities and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">最近活动</h2>
            </div>
            <Link 
              href="/projects" 
              className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
            >
              查看全部
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="text-sm text-gray-500">加载中...</div>
            ) : recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                    activity.color === "blue" ? "bg-blue-500" :
                    activity.color === "green" ? "bg-green-500" :
                    "bg-orange-500"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-medium text-gray-900">
                        {activity.text}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        activity.color === "blue" ? "bg-blue-100 text-blue-700" :
                        activity.color === "green" ? "bg-green-100 text-green-700" :
                        "bg-orange-100 text-orange-700"
                      }`}>
                        {activity.label}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTime(activity.time)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500 py-4">暂无活动</div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">快速操作</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/projects"
              className="p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors group"
            >
              <BookOpen className="w-5 h-5 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-medium text-gray-900">新建项目</div>
              <div className="text-xs text-gray-500 mt-1">添加新项目</div>
            </Link>
            <Link
              href="/leads"
              className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
            >
              <Users className="w-5 h-5 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-medium text-gray-900">查看需求</div>
              <div className="text-xs text-gray-500 mt-1">客户需求管理</div>
            </Link>
            <Link
              href="/reviews"
              className="p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors group"
            >
              <MessageSquare className="w-5 h-5 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-medium text-gray-900">审核评价</div>
              <div className="text-xs text-gray-500 mt-1">评价管理</div>
            </Link>
            <Link
              href="/schedule"
              className="p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors group"
            >
              <Calendar className="w-5 h-5 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-medium text-gray-900">日程管理</div>
              <div className="text-xs text-gray-500 mt-1">查看日程</div>
            </Link>
          </div>
        </div>
      </div>

      {/* Monthly Goal Progress */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">月度目标进度</h2>
          </div>
          <span className="text-sm text-gray-500">目标: {stats.totalProjects + 5} 个项目</span>
        </div>
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {loading ? "..." : stats.totalProjects}
            </span>
            <span className="text-sm text-gray-600">
              已完成
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${goalProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-end">
            <span className="text-sm text-green-600 font-medium">
              {loading ? "..." : `${Math.round(goalProgress)}% 完成`}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
