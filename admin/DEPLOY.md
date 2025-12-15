# Vercel 部署指南

## 快速部署步骤

### 方法 1：通过 Vercel Dashboard（推荐）

1. **登录 Vercel**
   - 访问 https://vercel.com
   - 使用 GitHub/GitLab/Bitbucket 账号登录

2. **创建新项目**
   - 点击 "Add New Project"
   - 选择你的代码仓库（如果还没有，先连接仓库）

3. **配置项目**
   - **Project Name**: `weidu-admin`（或你喜欢的名称）
   - **Root Directory**: 选择 `admin` 文件夹
   - **Framework Preset**: Next.js（会自动检测）
   - **Build Command**: `npm run build`（自动）
   - **Output Directory**: `.next`（自动）
   - **Install Command**: `npm install`（自动）

4. **环境变量（可选）**
   如果需要使用自己的 Supabase 项目，添加以下环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`: 你的 Supabase 项目 URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 你的 Supabase Anon Key
   
   > 如果不添加，会使用代码中的默认值

5. **部署**
   - 点击 "Deploy"
   - 等待构建完成（通常 1-2 分钟）

6. **访问后台**
   - 部署完成后会得到一个 URL，如：`https://weidu-admin.vercel.app`
   - 访问该 URL 即可使用后台

### 方法 2：通过 Vercel CLI

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **进入 admin 目录并部署**
   ```bash
   cd admin
   vercel
   ```

4. **按照提示操作**
   - 选择项目设置
   - 确认配置
   - 等待部署完成

### 添加自定义域名

1. **在 Vercel Dashboard 中**
   - 进入项目 → Settings → Domains
   - 添加你的域名，如：`admin.yourdomain.com`

2. **配置 DNS**
   - 在你的域名服务商添加 CNAME 记录：
     - 类型：CNAME
     - 名称：admin
     - 值：cname.vercel-dns.com（或 Vercel 提供的值）

3. **等待 DNS 生效**
   - 通常需要几分钟到几小时

## 部署后的访问地址

- **默认地址**: `https://your-project-name.vercel.app`
- **自定义域名**: `https://admin.yourdomain.com`

## 首次使用

1. 访问部署后的地址
2. 如果还没有管理员账号，访问 `/setup` 页面创建
3. 创建完成后，使用账号登录

## 故障排查

### 构建失败
- 检查 Node.js 版本（需要 18+）
- 检查依赖是否正确安装
- 查看 Vercel 构建日志

### 无法访问
- 检查域名 DNS 配置
- 确认项目已成功部署
- 检查环境变量是否正确

### 登录问题
- 确认 Supabase 配置正确
- 检查 RLS 策略是否已设置
- 查看浏览器控制台错误信息





