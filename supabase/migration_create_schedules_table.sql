-- 创建 schedules 表
CREATE TABLE IF NOT EXISTS public.schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME,
    description TEXT,
    images TEXT[],
    enable_notification BOOLEAN DEFAULT false,
    notification_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 启用 RLS
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许已认证用户所有操作
CREATE POLICY "schedules_admin_all"
ON public.schedules FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_schedules_date ON public.schedules(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_schedules_notification ON public.schedules(enable_notification, notification_sent, scheduled_date) 
WHERE enable_notification = true AND notification_sent = false;


