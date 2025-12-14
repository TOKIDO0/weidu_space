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
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
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

      // 加载即将到来的事件（客户预约和日程）
      const now = new Date()
      const futureDate = new Date(now)
      futureDate.setDate(now.getDate() + 30) // 未来30天

      // 加载未来预约
      const { data: upcomingLeads } = await supabase
        .from("leads")
        .select("id, name, appointment_time, message")
        .eq("contact_type", "appointment")
        .not("appointment_time", "is", null)
        .gte("appointment_time", now.toISOString())
        .lte("appointment_time", futureDate.toISOString())
        .order("appointment_time", { ascending: true })
        .limit(4)

      // 加载未来日程
      const { data: upcomingSchedules } = await supabase
        .from("schedules")
        .select("id, title, scheduled_date, scheduled_time")
        .gte("scheduled_date", now.toISOString().split('T')[0])
        .lte("scheduled_date", futureDate.toISOString().split('T')[0])
        .order("scheduled_date", { ascending: true })
        .limit(4)

      const events: any[] = []
      
      upcomingLeads?.forEach((lead) => {
        if (lead.appointment_time) {
          events.push({
            id: lead.id,
            title: `${lead.name} - 客户预约`,
            time: new Date(lead.appointment_time),
            type: "appointment",
            color: "purple",
          })
        }
      })

      upcomingSchedules?.forEach((schedule) => {
        const eventDate = new Date(schedule.scheduled_date)
        if (schedule.scheduled_time) {
          const [hours, minutes] = schedule.scheduled_time.split(':')
          eventDate.setHours(parseInt(hours), parseInt(minutes))
        }
        events.push({
          id: schedule.id,
          title: schedule.title,
          time: eventDate,
          type: "schedule",
          color: "green",
        })
      })

      events.sort((a, b) => a.time.getTime() - b.time.getTime())
      setUpcomingEvents(events.slice(0, 4))
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">仪表盘概览</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          欢迎回来！这是维度空间后台的概览信息。
        </p>
      </div>

      {/* Stats Cards - 参考图二设计，使用响应式网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {/* Total Projects - 紫色渐变 */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-xl p-6 border border-purple-300 dark:border-purple-800 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="text-4xl font-bold text-white mb-2">
            {loading ? "..." : stats.totalProjects}
          </div>
          <div className="text-sm text-white/90 dark:text-white/80 font-semibold mb-2">总项目数</div>
          <div className="text-xs text-white/80 dark:text-white/70 font-medium bg-white/20 dark:bg-white/10 rounded-full px-3 py-1 inline-block">
            +{stats.newProjectsThisMonth} 本月新增
          </div>
        </div>

        {/* Total Leads - 蓝色渐变 */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl p-6 border border-blue-300 dark:border-blue-800 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Users className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="text-4xl font-bold text-white mb-2">
            {loading ? "..." : stats.totalLeads}
          </div>
          <div className="text-sm text-white/90 dark:text-white/80 font-semibold mb-2">客户需求总数</div>
          <div className="text-xs text-white/80 dark:text-white/70 font-medium bg-white/20 dark:bg-white/10 rounded-full px-3 py-1 inline-block">
            +{stats.newLeadsThisWeek} 本周新增
          </div>
        </div>

        {/* Total Reviews - 绿色渐变 */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-xl p-6 border border-green-300 dark:border-green-800 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="text-4xl font-bold text-white mb-2">
            {loading ? "..." : stats.totalReviews}
          </div>
          <div className="text-sm text-white/90 dark:text-white/80 font-semibold mb-2">评价总数</div>
          <div className="text-xs text-white/80 dark:text-white/70 font-medium bg-white/20 dark:bg-white/10 rounded-full px-3 py-1 inline-block">
            较上月增长
          </div>
        </div>

        {/* Active Leads - 橙色渐变 */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-xl p-6 border border-orange-300 dark:border-orange-800 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Heart className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="text-4xl font-bold text-white mb-2">
            {loading ? "..." : stats.activeLeads}
          </div>
          <div className="text-sm text-white/90 dark:text-white/80 font-semibold mb-2">待处理需求</div>
          <div className="text-xs text-white/80 dark:text-white/70 font-medium bg-white/20 dark:bg-white/10 rounded-full px-3 py-1 inline-block">
            本周已处理
          </div>
        </div>
      </div>

      {/* Recent Activities and Quick Actions - 使用响应式网格 */}
      <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
        {/* Recent Activities */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">最近活动</h2>
            </div>
            <Link 
              href="/projects" 
              className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium flex items-center gap-1"
            >
              查看全部
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">加载中...</div>
            ) : recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                    activity.color === "blue" ? "bg-blue-500" :
                    activity.color === "green" ? "bg-green-500" :
                    "bg-orange-500"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.text}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        activity.color === "blue" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" :
                        activity.color === "green" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
                        "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
                      }`}>
                        {activity.label}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(activity.time)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400 py-4">暂无活动</div>
            )}
          </div>
        </div>

        {/* Upcoming Events - 参考图二设计 */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">即将到来的事件</h2>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">加载中...</div>
            ) : upcomingEvents.length > 0 ? (
              upcomingEvents.map((event, index) => {
                const eventDate = new Date(event.time)
                const timeStr = eventDate.toLocaleTimeString("zh-CN", { 
                  hour: "2-digit", 
                  minute: "2-digit",
                  hour12: false 
                })
                const dateStr = eventDate.toLocaleDateString("zh-CN", {
                  month: "short",
                  day: "numeric"
                })
                return (
                  <div key={event.id || index} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {event.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-medium ${
                          event.color === "purple" 
                            ? "text-purple-600 dark:text-purple-400" 
                            : "text-green-600 dark:text-green-400"
                        }`}>
                          {timeStr}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {dateStr}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400 py-4">暂无即将到来的事件</div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Goal Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">月度目标进度</h2>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">目标: {stats.totalProjects + 5} 个项目</span>
        </div>
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {loading ? "..." : stats.totalProjects}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              已完成
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${goalProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-end">
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
              {loading ? "..." : `${Math.round(goalProgress)}% 完成`}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
