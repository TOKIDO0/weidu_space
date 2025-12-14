# Supabase RLS 策略修复 SQL

当 Supabase MCP 配置好 service_role key 后，将执行以下 SQL：

```sql
-- 修复 RLS 策略
-- 确保已登录用户可以操作 projects 表

-- 删除现有的 projects_admin_all 策略
DROP POLICY IF EXISTS "projects_admin_all" ON public.projects;

-- 重新创建策略，允许已登录用户进行所有操作
CREATE POLICY "projects_admin_all"
ON public.projects FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- 同样修复 reviews 表的策略（允许管理员查看所有评价，包括未审核的）
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

## 安全提醒

⚠️ **重要**：service_role key 具有完全数据库访问权限，请确保：
1. 不要在代码仓库中提交 service_role key
2. 不要在公开场所分享
3. 只在受信任的环境中使用
4. 如果怀疑泄露，立即在 Supabase Dashboard 中重新生成


