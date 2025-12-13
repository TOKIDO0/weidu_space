"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import type { ProjectRow } from "@/lib/types"
import { Button, Card, Input, Textarea } from "@/components/ui"

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

  const isEditing = useMemo(() => Boolean(draft.id), [draft.id])

  async function load() {
    setError("")
    setLoading(true)
    const { data, error } = await supabase
      .from("projects")
      .select("*")
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

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card
        title="项目列表"
        right={
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={load} disabled={loading}>
              刷新
            </Button>
            <Button onClick={resetDraft}>新建</Button>
          </div>
        }
      >
        {error ? (
          <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="text-sm text-neutral-400">加载中...</div>
        ) : rows.length ? (
          <div className="space-y-3">
            {rows.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-white/10 bg-neutral-950/40 px-4 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-sm font-semibold text-white">
                        {r.title}
                      </div>
                      {r.published ? (
                        <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[11px] text-green-200">
                          已发布
                        </span>
                      ) : (
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-neutral-300">
                          未发布
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">
                      {r.category ?? "-"} · {r.location ?? "-"} · sort:
                      {r.sort_order ?? 0}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Button variant="ghost" onClick={() => editRow(r)}>
                      编辑
                    </Button>
                    <Button variant="ghost" onClick={() => togglePublish(r)}>
                      {r.published ? "下架" : "上架"}
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
          <div className="text-sm text-neutral-400">暂无项目</div>
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
            <label className="block text-xs text-neutral-400 mb-2">
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
              <label className="block text-xs text-neutral-400 mb-2">
                分类
              </label>
              <Input
                value={draft.category}
                onChange={(e) =>
                  setDraft({ ...draft, category: e.target.value })
                }
                placeholder="住宅设计 / 商业空间 ..."
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-2">
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
              <label className="block text-xs text-neutral-400 mb-2">
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
              <label className="block text-xs text-neutral-400 mb-2">
                面积
              </label>
              <Input
                value={draft.area}
                onChange={(e) => setDraft({ ...draft, area: e.target.value })}
                placeholder="240 m²"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-2">
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
            <label className="block text-xs text-neutral-400 mb-2">
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
            <label className="block text-xs text-neutral-400 mb-2">
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
            <label className="block text-xs text-neutral-400 mb-2">
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
              <label className="block text-xs text-neutral-400 mb-2">
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
              <label className="flex items-center gap-2 text-sm text-neutral-300">
                <input
                  type="checkbox"
                  checked={draft.published}
                  onChange={(e) =>
                    setDraft({ ...draft, published: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-white/20 bg-neutral-950 accent-orange-500"
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


