"use client"

export function Card({
  title,
  children,
  right,
}: {
  title: string
  right?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-6 py-4">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {right}
      </div>
      <div className="p-6">{children}</div>
    </section>
  )
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        "w-full rounded-2xl border border-white/10 bg-neutral-950 px-4 py-3 text-sm outline-none focus:border-orange-500",
        props.className ?? "",
      ].join(" ")}
    />
  )
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      className={[
        "w-full rounded-2xl border border-white/10 bg-neutral-950 px-4 py-3 text-sm outline-none focus:border-orange-500",
        props.className ?? "",
      ].join(" ")}
    />
  )
}

export function Button({
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger"
}) {
  const cls =
    variant === "primary"
      ? "bg-orange-500 hover:bg-orange-600 text-white"
      : variant === "danger"
        ? "bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-100"
        : "bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-200"
  return (
    <button
      {...props}
      className={[
        "rounded-2xl px-4 py-2 text-xs font-semibold transition disabled:opacity-60",
        cls,
        props.className ?? "",
      ].join(" ")}
    />
  )
}


