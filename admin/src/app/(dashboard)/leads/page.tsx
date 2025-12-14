"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import type { LeadRow } from "@/lib/types"
import { Button, Card, Input, Textarea } from "@/components/ui"

function fmt(dt: string | null) {
  if (!dt) return "-"
  const d = new Date(dt)
  if (Number.isNaN(d.getTime())) return dt
  return d.toLocaleString()
}

export default function LeadsPage() {
  const [rows, setRows] = useState<LeadRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [editing, setEditing] = useState<LeadRow | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    setError("")
    setLoading(true)
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setRows((data ?? []) as LeadRow[])
  }

  useEffect(() => {
    load()
  }, [])

  async function remove(id: string) {
    if (!confirm("确定要删除这条客户需求吗？")) return
    const { error } = await supabase.from("leads").delete().eq("id", id)
    if (error) {
      alert(error.message)
      return
    }
    await load()
  }

  async function quickStatus(id: string, status: LeadRow["status"]) {
    const { error } = await supabase.from("leads").update({ status }).eq("id", id)
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
      .from("leads")
      .update({
        status: editing.status,
        note: editing.note,
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
        title="客户需求列表"
        right={
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={load} disabled={loading}>
              刷新
            </Button>
          </div>
        }
      >
        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">加载中...</div>
        ) : rows.length ? (
          <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
            {rows.map((r) => (
              <div
                key={r.id}
                className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                        {r.name}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{r.phone}</span>
                      <span className="rounded-full bg-gray-200 dark:bg-gray-700 px-2 py-0.5 text-[11px] text-gray-600 dark:text-gray-400 font-medium">
                        {r.contact_type === "appointment"
                          ? "预约时间"
                          : "立即联系"}
                      </span>
                      <span className={`
                        rounded-full px-2 py-0.5 text-[11px] font-semibold
                        ${r.status === "new" 
                          ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700" 
                          : r.status === "contacted"
                          ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700"
                          : "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700"
                        }
                      `}>
                        {r.status === "new" ? "待处理" : r.status === "contacted" ? "已联系" : "已完成"}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                      {r.message}
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      创建：{fmt(r.created_at)}；预约：{fmt(r.appointment_time)}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Button variant="ghost" onClick={() => setEditing(r)}>
                      处理
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => quickStatus(r.id, "contacted")}
                    >
                      已联系
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => quickStatus(r.id, "done")}
                    >
                      已完成
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
          <div className="text-sm text-gray-500 dark:text-gray-400">暂无客户需求</div>
        )}
      </Card>

      <Card
        title={editing ? "处理客户需求" : "处理区"}
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
            在左侧选择一条需求点击"处理"。
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
                  客户
                </label>
                <Input value={editing.name} readOnly />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
                  电话
                </label>
                <Input value={editing.phone} readOnly />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
                  联系方式
                </label>
                <Input
                  value={
                    editing.contact_type === "appointment"
                      ? "预约时间"
                      : "立即联系"
                  }
                  readOnly
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
                  预约时间
                </label>
                <Input value={fmt(editing.appointment_time)} readOnly />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">需求</label>
              <Textarea rows={6} value={editing.message} readOnly />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
                  状态
                </label>
                <select
                  value={editing.status}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      status: e.target.value as LeadRow["status"],
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                >
                  <option value="new">待处理</option>
                  <option value="contacted">已联系</option>
                  <option value="done">已完成</option>
                </select>
              </div>
              <div />
            </div>

            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                备注（内部）
              </label>
              <Textarea
                rows={5}
                value={editing.note ?? ""}
                onChange={(e) =>
                  setEditing({ ...editing, note: e.target.value })
                }
                placeholder="例如：已加微信，约周三上午回访"
              />
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


