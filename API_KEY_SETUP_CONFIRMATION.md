# API Key 配置确认

## ✅ 配置状态

你已经在 `admin/.env.local` 文件中设置了：
```
NEXT_PUBLIC_GEMINI_API_KEY = "你的API_Key"
```

## ⚠️ 重要提示

### 1. 重启开发服务器

**必须重启 Next.js 开发服务器**，环境变量才会生效：

1. 停止当前运行的开发服务器（按 `Ctrl+C`）
2. 重新启动：
   ```bash
   cd admin
   npm run dev
   ```

### 2. 环境变量格式

确保 `.env.local` 文件中的格式正确（**不要有多余的空格或引号**）：

```env
# ✅ 正确格式
NEXT_PUBLIC_GEMINI_API_KEY=你的API_Key

# ❌ 错误格式（不要这样写）
NEXT_PUBLIC_GEMINI_API_KEY = "你的API_Key"
NEXT_PUBLIC_GEMINI_API_KEY="你的API_Key"
```

### 3. 验证配置

重启服务器后，检查：

1. **后台 AI 助手**：打开后台页面，点击 AI 助手，发送一条消息测试
2. **前台 AI 助手**：访问 `ai-assistant.html`，发送消息测试
3. **控制台检查**：打开浏览器开发者工具，查看是否有 API Key 相关的警告

### 4. 如果仍然不工作

如果重启后仍然有问题，请检查：

1. `.env.local` 文件是否在 `admin` 目录下（不是项目根目录）
2. 文件内容是否正确（没有多余引号）
3. 开发服务器是否完全重启
4. 查看控制台是否有错误信息

### 5. 安全建议

虽然 `NEXT_PUBLIC_` 前缀会在客户端暴露，但：
- ✅ 前台 AI 助手通过 API 路由调用，API Key 保留在服务器端
- ⚠️ 后台 AI 助手直接使用 `NEXT_PUBLIC_GEMINI_API_KEY`，会在客户端代码中可见

**更安全的做法**（可选）：
- 将后台 AI 助手也改为通过 API 路由调用
- 或者使用不带 `NEXT_PUBLIC_` 前缀的 `GEMINI_API_KEY`，但需要修改代码为服务器端组件

## 📝 当前配置总结

- ✅ API 路由 (`/api/chat`) 使用环境变量
- ✅ 前台 AI 助手通过 API 路由调用（安全）
- ⚠️ 后台 AI 助手直接使用 `NEXT_PUBLIC_GEMINI_API_KEY`（会在客户端暴露）

重启服务器后，所有功能应该可以正常工作了！


