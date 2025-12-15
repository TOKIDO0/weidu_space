# Supabase 存储 Bucket 设置指南

## 问题
后台项目跟踪功能上传图片/视频时出现 "Bucket not found" 错误。

## 解决方案

### 方法1：通过 Supabase Dashboard 创建（推荐）

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **Storage** 页面
4. 点击 **New bucket** 按钮
5. 创建名为 `project-media` 的 bucket
6. 设置权限：
   - **Public bucket**: 勾选（允许公开访问）
   - **File size limit**: 50MB（或根据需要调整）
   - **Allowed MIME types**: 可以留空或设置 `image/*,video/*`

### 方法2：通过 SQL 创建存储策略（bucket需先在Dashboard创建）

**重要：** 存储 bucket 本身必须通过 Dashboard 创建，SQL 只能创建策略。

在 Supabase SQL Editor 中执行（创建 bucket 后）：

```sql
-- 设置存储策略（允许认证用户上传）
CREATE POLICY "Allow authenticated users to upload project media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-media');

-- 设置存储策略（允许认证用户更新）
CREATE POLICY "Allow authenticated users to update project media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'project-media');

-- 设置存储策略（允许认证用户删除）
CREATE POLICY "Allow authenticated users to delete project media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'project-media');

-- 设置存储策略（允许公开读取）
CREATE POLICY "Allow public read access to project media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'project-media');
```

## 验证

创建完成后，在后台项目跟踪页面尝试上传图片或视频，应该可以正常工作了。

