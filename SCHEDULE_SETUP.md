# 日程管理功能设置说明

## 1. 数据库设置

在 Supabase Dashboard 中执行以下 SQL 创建 `schedules` 表：

```sql
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
```

## 2. 存储桶设置

确保 Supabase Storage 中有一个名为 `images` 的存储桶，用于存储日程相关图片。

## 3. 定时推送设置

日程的定时推送功能通过 API 路由 `/api/schedule-notifications` 实现。

### 方式一：使用 Vercel Cron Jobs（推荐）

在 `vercel.json` 中添加 cron 配置：

```json
{
  "crons": [
    {
      "path": "/api/schedule-notifications",
      "schedule": "0 8 * * *"
    }
  ]
}
```

这将在每天上午 8 点检查并发送当天的日程提醒。

### 方式二：使用外部 Cron 服务

可以使用以下服务定期调用 API：
- [cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)
- [Uptime Robot](https://uptimerobot.com)

设置每天调用一次：`https://your-domain.com/api/schedule-notifications`

## 4. 环境变量

在 Vercel 项目设置中添加以下环境变量：

- `NTFY_TOKEN`: ntfy API 令牌（已硬编码在前台页面，后台 API 使用环境变量）
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase 服务端密钥（用于定时任务）

## 5. 功能说明

### 日历视图
- 红色标记：客户预约日期
- 蓝色标记：自定义日程日期
- 点击日期可查看或编辑日程

### 日程管理
- 可以添加自定义日程
- 支持上传图片（拖拽或 URL）
- 可以设置到期推送通知
- 客户预约自动显示在日历上

### 推送通知
- 当日程日期到达且 `enable_notification` 为 true 时，会通过 ntfy 推送通知
- 推送后自动标记 `notification_sent` 为 true，避免重复推送

