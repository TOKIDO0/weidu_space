# API Key 保护指南

## 问题
Gemini API Key 被泄露到 GitHub，存在安全风险。

## 解决方案

### 1. 环境变量配置

**重要：** 请将你的 Gemini API Key 粘贴到以下文件中：

#### 文件路径：`admin/.env.local`

创建或编辑这个文件，添加以下内容：

```env
# Gemini API Key（敏感信息，不要提交到Git）
NEXT_PUBLIC_GEMINI_API_KEY=你的Gemini_API_Key粘贴在这里
```

**注意：**
- `.env.local` 文件已经在 `.gitignore` 中，不会被提交到 Git
- 不要将 API Key 直接写在代码文件中
- 不要将 `.env.local` 文件提交到版本控制

### 2. 代码修改

代码已经修改为从环境变量读取 API Key：

- `admin/src/components/AIChat.tsx` - 后台 AI 助手
- `public/ai-assistant.html` - 前台 AI 助手（需要特殊处理，见下文）

### 3. 前台页面处理

由于 `public/ai-assistant.html` 是静态 HTML 文件，无法直接使用 Next.js 环境变量。

**推荐方案：创建 API 路由**

1. 在 `admin/src/app/api/chat/route.ts` 创建 API 路由（已创建）
2. 前台通过 API 路由调用，API Key 保留在服务器端

**临时方案：** 如果必须在前端使用，请手动编辑 `public/ai-assistant.html`，将 API Key 替换为你的新 Key，但**不要提交到 Git**。

### 4. 检查清单

- [ ] 已删除泄露的 API Key
- [ ] 已在 GitHub 上撤销旧的 API Key
- [ ] 已创建新的 API Key
- [ ] 已将新 API Key 添加到 `admin/.env.local`
- [ ] 已确认 `.env.local` 在 `.gitignore` 中
- [ ] 已检查代码中没有硬编码的 API Key

### 5. 安全最佳实践

1. **永远不要**将 API Key 提交到版本控制
2. **永远不要**在前端代码中硬编码 API Key
3. 使用环境变量存储敏感信息
4. 定期轮换 API Key
5. 在 Supabase/GitHub 等平台设置 API Key 使用限制

