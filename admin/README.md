# 维度空间后台管理系统

## 快速开始

### 本地开发
```bash
cd admin
npm install
npm run dev
```
然后访问 `http://localhost:3000`

### Vercel 部署

详细部署步骤请查看 [DEPLOY.md](./DEPLOY.md)

**快速部署**：
1. 在 Vercel Dashboard 创建新项目
2. 选择 `admin` 目录作为根目录
3. 框架会自动检测为 Next.js
4. 点击部署即可

## 默认路由

- `/` - 自动跳转到 `/login`
- `/login` - 登录页面
- `/setup` - 首次设置页面（创建管理员账号）
- `/projects` - 项目管理
- `/reviews` - 评价管理
- `/leads` - 客户需求管理
- `/schedule` - 日程管理

## 环境变量

如果需要使用自己的 Supabase 项目，在 Vercel 项目设置中添加：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

如果不设置，会使用代码中的默认值。
