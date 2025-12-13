## WeiDU 后台（admin）

这是 WeiDU 的后台管理系统（Next.js + Supabase），用于管理：
- 项目展示（projects）
- 用户评价（reviews）
- 客户需求线索（leads）

### 1) 配置环境变量

在 `admin/` 目录创建文件 `.env.local`（这个文件不要提交到 Git）：

```txt
NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase anon key
```

你也可以参考 `admin/env.example.txt`。

### 2) 初始化数据库（Supabase）

在 Supabase 控制台：SQL Editor 执行根目录的 `supabase/schema.sql`。

### 3) 创建管理员账号

在 Supabase 控制台：Auth → Users → Add user（邮箱/密码），用这个账号登录后台。

### 4) 本地运行

```bash
cd admin
npm run dev
```

浏览器访问 `http://localhost:3000/login`。

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

说明：后台使用 Supabase Auth 的“登录态 + RLS”控制权限。未登录用户会被重定向到 `/login`。

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
