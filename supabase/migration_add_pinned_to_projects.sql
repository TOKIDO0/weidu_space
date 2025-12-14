-- 为 projects 表添加 pinned 字段（如果表已存在）
-- 如果表不存在，schema.sql 中已经包含了 pinned 字段

-- 检查并添加 pinned 字段
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'projects' 
        AND column_name = 'pinned'
    ) THEN
        ALTER TABLE public.projects 
        ADD COLUMN pinned boolean NOT NULL DEFAULT false;
    END IF;
END $$;

