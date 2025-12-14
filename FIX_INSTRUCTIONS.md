# 修复说明

## 1. RLS 策略修复（必须在 Supabase 中执行）

由于创建项目时出现 RLS 策略错误，需要在 Supabase SQL Editor 中执行以下 SQL：

```sql
-- 修复 projects 表的 RLS 策略
DROP POLICY IF EXISTS "projects_admin_all" ON public.projects;

CREATE POLICY "projects_admin_all"
ON public.projects FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- 修复 reviews 表的 RLS 策略（允许管理员查看所有评价，包括未审核的）
DROP POLICY IF EXISTS "reviews_admin_all" ON public.reviews;

CREATE POLICY "reviews_admin_all"
ON public.reviews FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- 确保 leads 表的策略正确
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

执行步骤：
1. 登录 Supabase Dashboard
2. 进入项目 `aitxgwfqtcrxxcglwmrq`
3. 点击左侧 "SQL Editor"
4. 创建新查询，粘贴上述 SQL
5. 点击 "Run" 执行

## 2. 代码修复已完成

✅ 分类字段已改为下拉选项（住宅设计、商业设计）
✅ 评价提交功能已确认正确
✅ 后台评价查询不需要修改（RLS 策略修复后即可正常显示）

## 3. 评价显示问题原因

前台提交的评价默认 `approved = false`（待审核），后台应该能通过 `reviews_admin_all` 策略查看所有评价。但如果策略没有正确应用，就会看不到未审核的评价。

执行上述 SQL 后，后台应该能正常查看所有评价（包括待审核的）。


