# 智谱AI API配置说明

## 环境变量配置

为了使用智谱AI的GLM-4.5-Flash模型，需要在Vercel项目设置中配置环境变量。

### 在Vercel中配置

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 进入 **Settings** > **Environment Variables**
4. 添加以下环境变量：
   - **Name**: `ZHIPU_API_KEY`
   - **Value**: `134b9473dc394a4daed23215d83afa5b.ZadcUoYXwThS2Yvd`
   - **Environment**: 选择所有环境（Production, Preview, Development）

5. 保存后，重新部署项目

### 本地开发配置

如果需要本地开发，在 `admin` 目录下创建 `.env.local` 文件：

```
ZHIPU_API_KEY=134b9473dc394a4daed23215d83afa5b.ZadcUoYXwThS2Yvd
```

**注意**：`.env.local` 文件已在 `.gitignore` 中，不会被提交到GitHub。

## API使用说明

- 模型：GLM-4.5-Flash
- 响应方式：流式响应（Stream）
- API端点：`https://open.bigmodel.cn/api/paas/v4/chat/completions`

## 安全说明

✅ API Key 只在服务器端使用，不会暴露到前端代码
✅ API Key 通过环境变量配置，不会提交到Git仓库
✅ 所有API调用都通过后端路由 `/api/chat` 进行，确保安全性

