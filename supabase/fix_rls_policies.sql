-- 修复 RLS 策略
-- 确保已登录用户可以操作 projects 表

-- 删除现有的 projects_admin_all 策略
drop policy if exists "projects_admin_all" on public.projects;

-- 重新创建策略，允许已登录用户进行所有操作
create policy "projects_admin_all"
on public.projects for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

-- 同样修复 reviews 表的策略
drop policy if exists "reviews_admin_all" on public.reviews;

create policy "reviews_admin_all"
on public.reviews for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

-- 修复 leads 表的策略
drop policy if exists "leads_admin_all" on public.leads;
drop policy if exists "leads_select_admin" on public.leads;

create policy "leads_select_admin"
on public.leads for select
using (auth.uid() is not null);

create policy "leads_admin_all"
on public.leads for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

