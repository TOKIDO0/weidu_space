"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import type { ProjectRow } from "@/lib/types"
import { Button, Card, Input, Textarea } from "@/components/ui"
import { Search, X } from "lucide-react"

type ProjectDraft = {
  id?: string
  title: string
  category: string
  location: string
  duration: string
  area: string
  cost: string
  description: string
  cover_url: string
  images_text: string
  published: boolean
  pinned: boolean
  sort_order: number
}

const emptyDraft = (): ProjectDraft => ({
  title: "",
  category: "",
  location: "",
  duration: "",
  area: "",
  cost: "",
  description: "",
  cover_url: "",
  images_text: "",
  published: true,
  pinned: false,
  sort_order: 0,
})

function toImages(text: string) {
  const arr = text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
  return arr.length ? arr : null
}

export default function ProjectsPage() {
  const [rows, setRows] = useState<ProjectRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>("")
  const [draft, setDraft] = useState<ProjectDraft>(emptyDraft())
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const isEditing = useMemo(() => Boolean(draft.id), [draft.id])
  
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rows
    const query = searchQuery.toLowerCase().trim()
    return rows.filter((r) => {
      const id = r.id?.toLowerCase() || ""
      const location = r.location?.toLowerCase() || ""
      const category = r.category?.toLowerCase() || ""
      const title = r.title?.toLowerCase() || ""
      return id.includes(query) || location.includes(query) || category.includes(query) || title.includes(query)
    })
  }, [rows, searchQuery])

  async function load() {
    setError("")
    setLoading(true)
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("pinned", { ascending: false })
      .order("sort_order", { ascending: false })
      .order("created_at", { ascending: false })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setRows((data ?? []) as ProjectRow[])
  }

  useEffect(() => {
    load()
  }, [])

  function editRow(r: ProjectRow) {
    setDraft({
      id: r.id,
      title: r.title ?? "",
      category: r.category ?? "",
      location: r.location ?? "",
      duration: r.duration ?? "",
      area: r.area ?? "",
      cost: r.cost ?? "",
      description: r.description ?? "",
      cover_url: r.cover_url ?? "",
      images_text: (r.images ?? []).join("\n"),
      published: Boolean(r.published),
      pinned: Boolean(r.pinned),
      sort_order: Number(r.sort_order ?? 0),
    })
  }

  function resetDraft() {
    setDraft(emptyDraft())
  }

  async function save() {
    setSaving(true)
    setError("")
    const payload = {
      title: draft.title.trim(),
      category: draft.category.trim() || null,
      location: draft.location.trim() || null,
      duration: draft.duration.trim() || null,
      area: draft.area.trim() || null,
      cost: draft.cost.trim() || null,
      description: draft.description.trim() || null,
      cover_url: draft.cover_url.trim() || null,
      images: toImages(draft.images_text),
      published: draft.published,
      pinned: draft.pinned,
      sort_order: Number.isFinite(draft.sort_order) ? draft.sort_order : 0,
    }

    if (!payload.title) {
      setSaving(false)
      setError("标题不能为空")
      return
    }

    const res = draft.id
      ? await supabase.from("projects").update(payload).eq("id", draft.id)
      : await supabase.from("projects").insert(payload)

    setSaving(false)
    if (res.error) {
      setError(res.error.message)
      return
    }
    resetDraft()
    await load()
  }

  async function remove(id: string) {
    if (!confirm("确定要删除这个项目吗？")) return
    const { error } = await supabase.from("projects").delete().eq("id", id)
    if (error) {
      alert(error.message)
      return
    }
    await load()
  }

  async function togglePublish(r: ProjectRow) {
    const { error } = await supabase
      .from("projects")
      .update({ published: !r.published })
      .eq("id", r.id)
    if (error) {
      alert(error.message)
      return
    }
    await load()
  }

  async function togglePin(r: ProjectRow) {
    const { error } = await supabase
      .from("projects")
      .update({ pinned: !r.pinned })
      .eq("id", r.id)
    if (error) {
      alert(error.message)
      return
    }
    await load()
  }

  return (
    <div className="grid gap-4 sm:gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
      <Card
        title="项目列表"
        right={
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
            <Button 
              variant="ghost" 
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
            >
              <Search className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">搜索</span>
            </Button>
            <Button variant="ghost" onClick={load} disabled={loading} className="text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2">
              <span className="hidden sm:inline">刷新</span>
              <span className="sm:hidden">刷新</span>
            </Button>
            <Button onClick={resetDraft} className="text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2">
              <span className="hidden sm:inline">新建</span>
              <span className="sm:hidden">新建</span>
            </Button>
          </div>
        }
      >
        {/* 搜索框 */}
        <div 
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            searchOpen ? "max-h-20 opacity-100 mb-4" : "max-h-0 opacity-0 mb-0"
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="搜索项目ID、地点、分类、标题..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {searchQuery && (
              <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                找到 {filteredRows.length} 个项目
              </div>
            )}
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">加载中...</div>
        ) : filteredRows.length ? (
          <div className="space-y-3">
            {filteredRows.map((r) => (
              <div
                key={r.id}
                className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                        {r.title}
                      </div>
                      {r.pinned ? (
                        <span className="rounded-full bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 text-[11px] text-orange-700 dark:text-orange-400 font-medium">
                          置顶
                        </span>
                      ) : null}
                      {r.published ? (
                        <span className="rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-[11px] text-green-700 dark:text-green-400 font-medium">
                          已发布
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-200 dark:bg-gray-700 px-2 py-0.5 text-[11px] text-gray-600 dark:text-gray-400 font-medium">
                          未发布
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {r.category ?? "-"} · {r.location ?? "-"} · sort:
                      {r.sort_order ?? 0}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-1 sm:gap-2">
                    <Button variant="ghost" onClick={() => editRow(r)} className="text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2">
                      编辑
                    </Button>
                    <Button variant="ghost" onClick={() => togglePin(r)} className="text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2">
                      {r.pinned ? "取消置顶" : "置顶"}
                    </Button>
                    <Button variant="ghost" onClick={() => togglePublish(r)} className="text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2">
                      {r.published ? "下架" : "上架"}
                    </Button>
                    <Button variant="danger" onClick={() => remove(r.id)} className="text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2">
                      删除
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : searchQuery ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">未找到匹配的项目</div>
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400">暂无项目</div>
        )}
      </Card>

      <Card
        title={isEditing ? "编辑项目" : "新建项目"}
        right={
          isEditing ? (
            <Button variant="ghost" onClick={resetDraft}>
              取消编辑
            </Button>
          ) : null
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
              标题（必填）
            </label>
            <Input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="例如：静谧·私宅"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
                分类
              </label>
              <select
                value={draft.category}
                onChange={(e) =>
                  setDraft({ ...draft, category: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="">请选择分类</option>
                <option value="住宅设计">住宅设计</option>
                <option value="商业设计">商业设计</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
                地点
              </label>
              <Input
                value={draft.location}
                onChange={(e) =>
                  setDraft({ ...draft, location: e.target.value })
                }
                placeholder="上海 / 北京 ..."
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
                工期
              </label>
              <Input
                value={draft.duration}
                onChange={(e) =>
                  setDraft({ ...draft, duration: e.target.value })
                }
                placeholder="8 个月"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
                面积
              </label>
              <Input
                value={draft.area}
                onChange={(e) => setDraft({ ...draft, area: e.target.value })}
                placeholder="240 m²"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
                造价
              </label>
              <Input
                value={draft.cost}
                onChange={(e) => setDraft({ ...draft, cost: e.target.value })}
                placeholder="¥ 850,000"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
              封面图 URL
            </label>
            <Input
              value={draft.cover_url}
              onChange={(e) =>
                setDraft({ ...draft, cover_url: e.target.value })
              }
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
              项目图片（每行一个 URL）
            </label>
            <Textarea
              rows={5}
              value={draft.images_text}
              onChange={(e) =>
                setDraft({ ...draft, images_text: e.target.value })
              }
              placeholder="https://...\nhttps://..."
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
              描述
            </label>
            <Textarea
              rows={6}
              value={draft.description}
              onChange={(e) =>
                setDraft({ ...draft, description: e.target.value })
              }
              placeholder="项目介绍..."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
                排序（越大越靠前）
              </label>
              <Input
                type="number"
                value={draft.sort_order}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    sort_order: Number(e.target.value || 0),
                  })
                }
              />
            </div>
            <div className="flex items-end gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={draft.pinned}
                  onChange={(e) =>
                    setDraft({ ...draft, pinned: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-purple-600 focus:ring-purple-500"
                />
                置顶
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={draft.published}
                  onChange={(e) =>
                    setDraft({ ...draft, published: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-purple-600 focus:ring-purple-500"
                />
                立即发布
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={save} disabled={saving}>
              {saving ? "保存中..." : isEditing ? "保存修改" : "创建项目"}
            </Button>
            <Button variant="ghost" onClick={resetDraft} disabled={saving}>
              清空
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}


