# 客户画像分析功能实现指南

## 功能概述
分析客户需求数据，生成客户画像（预算范围、风格偏好、关注点等），优化营销策略。

## 实现步骤

### 1. 数据库设计

创建客户画像分析表：

```sql
-- 客户画像分析表
CREATE TABLE IF NOT EXISTS customer_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_leads INTEGER NOT NULL DEFAULT 0,
  budget_distribution JSONB, -- { "0-10万": 10, "10-30万": 25, ... }
  style_preferences JSONB, -- { "现代": 15, "简约": 20, ... }
  contact_type_distribution JSONB, -- { "immediate": 30, "appointment": 15 }
  popular_keywords TEXT[], -- 高频关键词
  average_response_time INTERVAL, -- 平均响应时间
  conversion_rate DECIMAL(5,2), -- 转化率
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_customer_analytics_date ON customer_analytics(analysis_date DESC);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_customer_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customer_analytics_updated_at
  BEFORE UPDATE ON customer_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_analytics_updated_at();
```

### 2. 后端实现

创建分析页面：`admin/src/app/(dashboard)/analytics/page.tsx`

主要功能：
- 从 `leads` 表提取数据
- 分析预算范围（从 message 中提取数字）
- 分析风格偏好（关键词匹配：现代、简约、欧式、美式等）
- 分析关注点（提取高频词汇）
- 计算转化率（从 new -> contacted -> completed）
- 生成可视化图表

### 3. 数据分析逻辑

```typescript
// 预算分析
function analyzeBudget(leads: Lead[]) {
  const budgetRanges = {
    "0-10万": 0,
    "10-30万": 0,
    "30-50万": 0,
    "50-100万": 0,
    "100万以上": 0
  }
  
  leads.forEach(lead => {
    const message = lead.message || ""
    const budgetMatch = message.match(/(\d+)[万千]/)
    if (budgetMatch) {
      const amount = parseInt(budgetMatch[1])
      // 分类逻辑...
    }
  })
  
  return budgetRanges
}

// 风格偏好分析
function analyzeStylePreferences(leads: Lead[]) {
  const styles = ["现代", "简约", "欧式", "美式", "中式", "日式", "工业风", "北欧"]
  const preferences = {}
  
  leads.forEach(lead => {
    const message = lead.message?.toLowerCase() || ""
    styles.forEach(style => {
      if (message.includes(style.toLowerCase())) {
        preferences[style] = (preferences[style] || 0) + 1
      }
    })
  })
  
  return preferences
}

// 关键词提取
function extractKeywords(leads: Lead[], topN = 10) {
  const wordCount = {}
  
  leads.forEach(lead => {
    const words = (lead.message || "").split(/[\s，。、；：]/)
    words.forEach(word => {
      if (word.length > 1) {
        wordCount[word] = (wordCount[word] || 0) + 1
      }
    })
  })
  
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word, count]) => ({ word, count }))
}
```

### 4. 可视化组件

使用 Chart.js 或 Recharts 创建图表：
- 预算分布饼图
- 风格偏好柱状图
- 时间趋势折线图
- 关键词云图

### 5. 实现建议

1. **创建分析页面路由**：`/analytics`
2. **添加侧边栏菜单项**："数据分析"
3. **实现数据聚合函数**：定期分析或实时分析
4. **添加筛选功能**：按时间范围、项目类型筛选
5. **导出功能**：导出分析报告为 PDF/Excel

### 6. 技术栈

- **图表库**：Recharts 或 Chart.js
- **数据处理**：在服务端进行数据聚合
- **缓存**：使用 Redis 或 Supabase Edge Functions 缓存分析结果

