"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import type { ReviewRow } from "@/lib/types"
import { Button, Card, Textarea, Input } from "@/components/ui"

function clip(text: string, n = 80) {
  const t = (text ?? "").trim()
  if (t.length <= n) return t
  return t.slice(0, n) + "…"
}

export default function ReviewsPage() {
  const [rows, setRows] = useState<ReviewRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [editing, setEditing] = useState<ReviewRow | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    setError("")
    setLoading(true)
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setRows((data ?? []) as ReviewRow[])
  }

  useEffect(() => {
    load()
  }, [])

  async function toggle(id: string, patch: Partial<ReviewRow>) {
    const { error } = await supabase.from("reviews").update(patch).eq("id", id)
    if (error) {
      alert(error.message)
      return
    }
    await load()
  }

  async function remove(id: string) {
    if (!confirm("确定要删除这条评价吗？")) return
    const { error } = await supabase.from("reviews").delete().eq("id", id)
    if (error) {
      alert(error.message)
      return
    }
    await load()
  }

  async function saveEdit() {
    if (!editing) return
    setSaving(true)
    const { error } = await supabase
      .from("reviews")
      .update({
        name: editing.name,
        project_name: editing.project_name,
        rating: editing.rating,
        content: editing.content,
        avatar_url: editing.avatar_url,
        approved: editing.approved,
        pinned: editing.pinned,
      })
      .eq("id", editing.id)
    setSaving(false)
    if (error) {
      alert(error.message)
      return
    }
    setEditing(null)
    await load()
  }

  return (
    <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))' }}>
      <Card
        title="评价列表"
        right={
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={load} disabled={loading}>
              刷新
            </Button>
          </div>
        }
      >
        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">加载中...</div>
        ) : rows.length ? (
          <div className="space-y-3">
            {rows.map((r) => (
              <div
                key={r.id}
                className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                        {r.name || "匿名"}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {r.project_name || "-"}
                      </span>
                      {r.approved ? (
                        <span className="rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-[11px] text-green-700 dark:text-green-400 font-medium">
                          已通过
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-200 dark:bg-gray-700 px-2 py-0.5 text-[11px] text-gray-600 dark:text-gray-400 font-medium">
                          待审核
                        </span>
                      )}
                      {r.pinned ? (
                        <span className="rounded-full bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 text-[11px] text-orange-700 dark:text-orange-400 font-medium">
                          置顶
                        </span>
                      ) : null}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {r.rating ? `⭐ ${r.rating}` : "未评分"}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                      {clip(r.content, 120)}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Button variant="ghost" onClick={() => setEditing(r)}>
                      编辑
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => toggle(r.id, { approved: !r.approved })}
                    >
                      {r.approved ? "撤销通过" : "通过"}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => toggle(r.id, { pinned: !r.pinned })}
                    >
                      {r.pinned ? "取消置顶" : "置顶"}
                    </Button>
                    <Button variant="danger" onClick={() => remove(r.id)}>
                      删除
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400">暂无评价</div>
        )}
      </Card>

      <Card
        title={editing ? "编辑评价" : "编辑区"}
        right={
          editing ? (
            <Button variant="ghost" onClick={() => setEditing(null)}>
              取消
            </Button>
          ) : null
        }
      >
        {!editing ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            在左侧选择一条评价点击"编辑"。
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
                  昵称
                </label>
                <Input
                  value={editing.name ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
                  项目名
                </label>
                <Input
                  value={editing.project_name ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, project_name: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
                  评分（1-5）
                </label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={editing.rating ?? ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      rating: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
                  头像 URL（可选）
                </label>
                <Input
                  value={editing.avatar_url ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, avatar_url: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                内容
              </label>
              <Textarea
                rows={8}
                value={editing.content}
                onChange={(e) =>
                  setEditing({ ...editing, content: e.target.value })
                }
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={editing.approved}
                  onChange={(e) =>
                    setEditing({ ...editing, approved: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-purple-600 focus:ring-purple-500"
                />
                审核通过
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={editing.pinned}
                  onChange={(e) =>
                    setEditing({ ...editing, pinned: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-purple-600 focus:ring-purple-500"
                />
                置顶
              </label>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={saveEdit} disabled={saving}>
                {saving ? "保存中..." : "保存"}
              </Button>
              <Button variant="ghost" onClick={() => setEditing(null)}>
                关闭
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}


