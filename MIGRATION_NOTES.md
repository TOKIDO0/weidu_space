# 仓库分离迁移说明

## 已完成的工作

1. ✅ 创建了新的 admin 项目目录：`../weidu_admin_temp/`
2. ✅ 将所有 admin 相关代码迁移到新目录
3. ✅ 初始化了 Git 仓库并提交了代码
4. ✅ 更新了原仓库的 vercel.json（前台静态站点配置）

## 需要手动完成的步骤

### 1. 创建 GitHub 仓库

在 GitHub 上创建新仓库 `weidu_admin`：
- 访问：https://github.com/new
- 仓库名：`weidu_admin`
- 不要初始化任何文件
- 创建后复制仓库 URL

### 2. 推送 admin 代码到新仓库

在 `../weidu_admin_temp/` 目录执行：

```bash
git remote add origin https://github.com/TOKIDO0/weidu_admin.git
git branch -M main
git push -u origin main
```

### 3. 在 Vercel 中配置新项目

1. 登录 Vercel Dashboard
2. 点击 "Add New Project"
3. 导入 `weidu_admin` 仓库
4. 配置：
   - Framework: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. 添加环境变量（从旧项目复制）
6. 部署

### 4. 更新域名配置

- 在 Vercel 的 `weidu_admin` 项目中添加域名：`admin.105911.xyz`
- 确保 DNS 配置正确

### 5. 更新原仓库（前台）

原仓库 `weidu_space` 现在只包含前台静态文件：
- `public/` 目录包含所有 HTML 文件
- `vercel.json` 已更新为静态站点配置
- 域名：`www.105911.xyz` 或 `105911.xyz`

## 注意事项

- 两个项目现在完全独立
- 共享的资源（如 Supabase schema）保留在原仓库的 `supabase/` 目录
- 如果需要共享代码，考虑使用 npm 包或 git submodule

