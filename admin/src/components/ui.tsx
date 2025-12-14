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
    <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
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
        "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20",
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
        "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20",
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
      ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-sm"
      : variant === "danger"
        ? "bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
        : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
  return (
    <button
      {...props}
      className={[
        "rounded-lg px-4 py-2 text-sm font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed",
        cls,
        props.className ?? "",
      ].join(" ")}
    />
  )
}
