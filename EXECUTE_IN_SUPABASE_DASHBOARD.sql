-- ============================================
-- 在 Supabase Dashboard SQL Editor 中执行此 SQL
-- ============================================
-- 
-- 执行步骤：
-- 1. 登录 https://supabase.com/dashboard
-- 2. 进入项目：aitxgwfqtcrxxcglwmrq
-- 3. 点击左侧 "SQL Editor"
-- 4. 点击 "New query"
-- 5. 复制以下全部 SQL 并粘贴
-- 6. 点击 "Run" 执行
-- 7. 确认看到 "Success" 消息
--
-- ============================================

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

-- 修复 leads 表的 RLS 策略
DROP POLICY IF EXISTS "leads_admin_all" ON public.leads;
DROP POLICY IF EXISTS "leads_select_admin" ON public.leads;

CREATE POLICY "leads_select_admin"
ON public.leads FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "leads_admin_all"
ON public.leads FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- 执行完成后，您应该看到 "Success" 消息
-- 现在后台应该可以：
-- 1. 创建项目（不再出现 RLS 错误）
-- 2. 查看所有评价（包括待审核的）
-- 3. 管理客户需求
-- ============================================

