-- 创建项目进度表
CREATE TABLE IF NOT EXISTS project_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  customer_phone VARCHAR(20) NOT NULL,
  stage VARCHAR(50) NOT NULL, -- 施工阶段：design, construction, finishing, completed
  title VARCHAR(200) NOT NULL,
  description TEXT,
  images TEXT[], -- 图片URL数组
  videos TEXT[], -- 视频URL数组
  progress_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_project_progress_project_id ON project_progress(project_id);
CREATE INDEX IF NOT EXISTS idx_project_progress_customer_phone ON project_progress(customer_phone);
CREATE INDEX IF NOT EXISTS idx_project_progress_progress_date ON project_progress(progress_date DESC);

-- 启用RLS
ALTER TABLE project_progress ENABLE ROW LEVEL SECURITY;

-- RLS策略：任何人都可以读取（用于前台查询）
CREATE POLICY "任何人都可以读取项目进度" ON project_progress
  FOR SELECT
  USING (true);

-- RLS策略：只有认证用户可以插入和更新（后台管理）
CREATE POLICY "认证用户可以管理项目进度" ON project_progress
  FOR ALL
  USING (auth.role() = 'authenticated');

-- 更新updated_at触发器
CREATE OR REPLACE FUNCTION update_project_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_project_progress_updated_at
  BEFORE UPDATE ON project_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_project_progress_updated_at();

