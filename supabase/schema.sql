-- WeiDU 后台数据结构（Supabase Postgres）
-- 直接复制到 Supabase：SQL Editor 里执行即可

create extension if not exists "pgcrypto";

-- 通用 updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 项目（前台作品展示）
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  location text,
  duration text,
  area text,
  cost text,
  description text,
  cover_url text,
  images text[],
  published boolean not null default true,
  pinned boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

-- 评价（用户提交 → 后台审核）
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text,
  project_name text,
  rating int,
  content text not null,
  avatar_url text,
  approved boolean not null default false,
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reviews_rating_range check (rating is null or (rating >= 1 and rating <= 5))
);

drop trigger if exists trg_reviews_updated_at on public.reviews;
create trigger trg_reviews_updated_at
before update on public.reviews
for each row execute function public.set_updated_at();

-- 客户需求（线索）
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  message text not null,
  contact_type text not null,
  appointment_time timestamptz,
  status text not null default 'new',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leads_contact_type check (contact_type in ('immediate','appointment')),
  constraint leads_status check (status in ('new','contacted','done'))
);

drop trigger if exists trg_leads_updated_at on public.leads;
create trigger trg_leads_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

-- ======================
-- RLS（非常关键）
-- ======================

alter table public.projects enable row level security;
alter table public.reviews enable row level security;
alter table public.leads enable row level security;

-- 清理旧策略（避免重复执行时报错）
drop policy if exists "projects_select_published" on public.projects;
drop policy if exists "projects_admin_all" on public.projects;
drop policy if exists "reviews_select_approved" on public.reviews;
drop policy if exists "reviews_insert_public" on public.reviews;
drop policy if exists "reviews_admin_all" on public.reviews;
drop policy if exists "leads_insert_public" on public.leads;
drop policy if exists "leads_admin_all" on public.leads;
drop policy if exists "leads_select_admin" on public.leads;

-- projects：任何人只能看已发布；登录管理员可增删改查
create policy "projects_select_published"
on public.projects for select
using (published = true);

create policy "projects_admin_all"
on public.projects for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

-- reviews：任何人只能看已审核通过；任何人可提交（默认 approved=false）；管理员可管理全部
create policy "reviews_select_approved"
on public.reviews for select
using (approved = true);

create policy "reviews_insert_public"
on public.reviews for insert
with check (true);

create policy "reviews_admin_all"
on public.reviews for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

-- leads：任何人可提交；只有管理员可查看/更新/删除
create policy "leads_insert_public"
on public.leads for insert
with check (true);

create policy "leads_select_admin"
on public.leads for select
using (auth.uid() is not null);

create policy "leads_admin_all"
on public.leads for all
using (auth.uid() is not null)
with check (auth.uid() is not null);
