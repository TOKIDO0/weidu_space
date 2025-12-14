# 部署和修复步骤

## 重要：必须先执行 Supabase SQL 修复

在部署之前，**必须先在 Supabase 中执行 SQL 修复 RLS 策略**，否则后台无法创建项目。

### 执行步骤：

1. 登录 Supabase Dashboard: https://supabase.com/dashboard
2. 进入项目 `aitxgwfqtcrxxcglwmrq`
3. 点击左侧菜单 "SQL Editor"
4. 点击 "New query"
5. 复制以下 SQL 并粘贴：

```sql
-- 修复 projects 表的 RLS 策略
DROP POLICY IF EXISTS "projects_admin_all" ON public.projects;

CREATE POLICY "projects_admin_all"
ON public.projects FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- 修复 reviews 表的 RLS 策略（允许管理员查看所有评价）
DROP POLICY IF EXISTS "reviews_admin_all" ON public.reviews;

CREATE POLICY "reviews_admin_all"
ON public.reviews FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- 修复 leads 表的策略
DROP POLICY IF EXISTS "leads_admin_all" ON public.leads;
DROP POLICY IF EXISTS "leads_select_admin" ON public.leads;

CREATE POLICY "leads_select_admin"
ON public.leads FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "leads_admin_all"
ON public.leads FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);
```

6. 点击 "Run" 执行
7. 确认没有错误

## 代码已推送到 GitHub

✅ 所有代码修改已提交并推送到 GitHub: `https://github.com/TOKIDO0/weidu_space.git`

## Vercel 部署

### 前台部署（weidu 项目）

由于 Vercel MCP 工具当前无法使用，请手动部署：

1. 登录 Vercel Dashboard: https://vercel.com/dashboard
2. 找到 `weidu` 项目
3. 点击项目进入详情页
4. 点击 "Deployments" 标签
5. 找到最新的部署（应该会自动触发，因为代码已推送到 GitHub）
6. 如果没有自动部署，点击 "Redeploy" 按钮

### 后台部署（admin 项目）

1. 登录 Vercel Dashboard
2. 找到 `admin` 项目
3. 确保项目设置中：
   - Root Directory 设置为 `admin`
   - Framework Preset 为 Next.js
4. 同样检查是否有自动部署，或手动触发部署

## 已完成的修复

✅ **分类字段改为下拉选项**
   - 现在分类字段是下拉菜单，包含"住宅设计"和"商业设计"两个选项

✅ **评价提交功能**
   - 前台用户可以提交评价
   - 评价默认状态为"待审核"（approved = false）
   - 执行 SQL 修复后，后台可以看到所有评价（包括待审核的）

✅ **代码已提交到 GitHub**
   - 所有修改已推送到 main 分支

## 测试清单

执行 SQL 修复后，请测试：

1. ✅ 在后台创建项目 - 应该不再出现 RLS 错误
2. ✅ 在后台查看评价 - 应该能看到所有评价（包括待审核的）
3. ✅ 在前台提交评价 - 应该能成功提交
4. ✅ 在前台查看项目 - 应该能看到已发布的项目


