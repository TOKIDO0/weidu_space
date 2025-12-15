# 知识库同步说明

## 概述

已创建 `knowledge_base` 表用于存储所有网页内容，供AI助手查询使用。

## 使用方法

### 手动同步

调用API路由同步数据：

```bash
curl -X POST http://localhost:3000/api/sync-knowledge-base
```

或在浏览器中访问（需要认证）：
```
POST /api/sync-knowledge-base
```

### 自动同步

建议在以下情况下自动同步：
1. 创建/更新项目时
2. 创建/更新客户需求时
3. 创建/更新日程时
4. 创建/更新评价时

可以在相应的页面组件中添加同步调用。

## 知识库结构

- `content_type`: 内容类型（project, lead, schedule, review, general）
- `title`: 标题
- `content`: 详细内容
- `metadata`: JSON格式的元数据

## AI助手使用

AI助手会自动从知识库获取信息，无需额外配置。


