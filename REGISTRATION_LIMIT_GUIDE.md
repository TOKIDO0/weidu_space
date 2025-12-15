# 限制后台注册指南

## 如何限制其他人注册后台页面

### 方法一：在 Supabase Dashboard 中禁用注册（推荐）

1. 登录 Supabase Dashboard
2. 进入你的项目
3. 点击左侧菜单 **Authentication** → **Settings**
4. 找到 **"Enable email signup"** 选项
5. **关闭** 这个选项
6. 保存设置

这样，除了通过 `setup` 页面首次初始化管理员外，其他人无法注册新账号。

### 方法二：使用 Supabase Auth Hooks（更灵活）

在 Supabase Dashboard 中：
1. 进入 **Authentication** → **Hooks**
2. 创建新的 Hook，选择 **"Before signup"** 事件
3. 添加验证逻辑，只允许特定邮箱注册

### 方法三：在代码中检查管理员数量（已实现）

`setup` 页面已经通过 `claim_admin` RPC 函数实现了这个功能：
- 如果已经存在管理员，会提示错误
- 只允许第一次认领管理员

### 当前实现

1. **Setup 页面** (`admin/src/app/setup/page.tsx`)：
   - 添加了人机验证（滑动拼图）
   - 使用 `claim_admin` RPC 函数限制只能创建第一个管理员

2. **登录页面** (`admin/src/app/login/page.tsx`)：
   - 只允许已存在的用户登录
   - 没有注册功能

### 建议配置

**最佳实践**：
1. ✅ 在 Supabase Dashboard 中禁用公开注册
2. ✅ 保留 `setup` 页面用于首次初始化
3. ✅ 添加人机验证（已实现）
4. ✅ 使用 `claim_admin` 函数限制管理员数量（已实现）

### 安全建议

1. **定期检查管理员列表**：
   ```sql
   SELECT * FROM admins;
   ```

2. **监控异常登录**：
   - 在 Supabase Dashboard 中查看 Authentication Logs
   - 设置异常登录告警

3. **使用强密码策略**：
   - 在 Supabase Dashboard → Authentication → Settings 中配置密码策略

4. **启用双因素认证（2FA）**：
   - 在 Supabase Dashboard 中启用 2FA
   - 要求管理员启用 2FA

### 注意事项

- `setup` 页面应该只在首次部署时使用
- 部署后可以考虑删除或隐藏 `setup` 页面路由
- 如果需要添加新管理员，应该通过现有管理员在后台添加，而不是通过注册

