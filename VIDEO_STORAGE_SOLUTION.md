# 视频存储和播放方案

## 问题分析

Supabase Storage 虽然可以存储文件，但对于视频文件有以下限制：
1. **存储容量限制**：免费版只有 1GB 存储空间
2. **带宽限制**：免费版每月只有 2GB 传输量
3. **性能问题**：大视频文件加载慢，不适合直接播放

## 推荐方案

### 方案一：使用 Supabase Storage + 视频转码（推荐用于小视频）

**适用场景**：短视频（< 50MB）、项目进度更新视频

**实现步骤**：
1. 上传视频到 Supabase Storage
2. 使用 HTML5 `<video>` 标签播放
3. 添加 `preload="metadata"` 优化加载

**代码示例**：
```html
<video 
  src="https://your-project.supabase.co/storage/v1/object/public/images/video.mp4" 
  controls 
  preload="metadata"
  class="w-full rounded-lg"
>
  您的浏览器不支持视频播放
</video>
```

**优点**：
- 实现简单
- 无需额外服务
- 适合小文件

**缺点**：
- 存储和带宽有限
- 大视频加载慢
- 不支持自适应码率

---

### 方案二：使用云存储服务（推荐用于生产环境）

#### 2.1 阿里云 OSS（推荐国内使用）

**特点**：
- 存储容量大，价格便宜（约 0.12元/GB/月）
- 支持 CDN 加速
- 支持视频转码和播放
- 有免费额度

**实现步骤**：
1. 注册阿里云账号，开通 OSS
2. 创建存储桶（Bucket）
3. 上传视频到 OSS
4. 获取视频 URL
5. 使用阿里云视频点播服务（可选，支持转码、水印等）

**代码示例**：
```javascript
// 上传视频到 OSS
const OSS = require('ali-oss')
const client = new OSS({
  region: 'oss-cn-hangzhou',
  accessKeyId: 'YOUR_ACCESS_KEY',
  accessKeySecret: 'YOUR_SECRET_KEY',
  bucket: 'your-bucket-name'
})

async function uploadVideo(file) {
  const result = await client.put(`videos/${Date.now()}_${file.name}`, file)
  return result.url
}

// 前端播放
<video src="https://your-bucket.oss-cn-hangzhou.aliyuncs.com/videos/video.mp4" controls />
```

**费用**：
- 存储：约 0.12元/GB/月
- 流量：约 0.5元/GB（使用 CDN 更便宜）
- 请求：免费（前 100 万次）

---

#### 2.2 AWS S3 + CloudFront（推荐国外使用）

**特点**：
- 全球 CDN 加速
- 支持视频转码（AWS MediaConvert）
- 高可用性
- 有免费额度（12个月）

**实现步骤**：
1. 注册 AWS 账号
2. 创建 S3 存储桶
3. 配置 CloudFront 分发
4. 上传视频并获取 URL

**代码示例**：
```javascript
// 使用 AWS SDK
const AWS = require('aws-sdk')
const s3 = new AWS.S3({
  accessKeyId: 'YOUR_KEY',
  secretAccessKey: 'YOUR_SECRET',
  region: 'us-east-1'
})

async function uploadVideo(file) {
  const params = {
    Bucket: 'your-bucket',
    Key: `videos/${Date.now()}_${file.name}`,
    Body: file,
    ContentType: 'video/mp4'
  }
  const result = await s3.upload(params).promise()
  return result.Location
}
```

**费用**：
- 存储：约 $0.023/GB/月
- 传输：约 $0.085/GB（CloudFront）
- 免费额度：5GB 存储，20,000 GET 请求

---

#### 2.3 腾讯云 COS（国内备选）

**特点**：
- 价格便宜
- 支持 CDN
- 有免费额度

**费用**：
- 存储：约 0.118元/GB/月
- 流量：约 0.5元/GB

---

### 方案三：使用专业视频服务（推荐用于大量视频）

#### 3.1 七牛云（推荐）

**特点**：
- 专为视频优化
- 支持视频转码、截图、水印
- 价格便宜
- 有免费额度（10GB 存储 + 10GB 流量/月）

**实现步骤**：
1. 注册七牛云账号
2. 创建存储空间
3. 使用 SDK 上传视频
4. 使用七牛云播放器播放

**代码示例**：
```javascript
// 上传
const qiniu = require('qiniu')
const config = new qiniu.conf.Config()
const formUploader = new qiniu.form_up.FormUploader(config)

async function uploadVideo(file) {
  const token = getUploadToken() // 从后端获取
  const putExtra = new qiniu.form_up.PutExtra()
  const result = await formUploader.putFile(token, `videos/${file.name}`, file.path, putExtra)
  return `https://your-domain.com/${result.key}`
}

// 前端播放（使用七牛云播放器）
<script src="https://unpkg.com/qplayer@latest/dist/qplayer.min.js"></script>
<video id="player" data-video-url="https://your-domain.com/video.mp4"></video>
```

---

#### 3.2 阿里云视频点播（VOD）

**特点**：
- 专业视频服务
- 自动转码、截图
- 支持 HLS/DASH 自适应码率
- 防盗链、水印

**费用**：
- 存储：约 0.12元/GB/月
- 转码：约 0.01元/分钟
- 流量：约 0.5元/GB

---

## 推荐实施步骤

### 阶段一：快速上线（使用 Supabase）
1. 小视频（< 10MB）直接存 Supabase
2. 使用 HTML5 video 标签播放
3. 添加加载提示和错误处理

### 阶段二：优化体验（迁移到云存储）
1. 选择阿里云 OSS 或七牛云
2. 迁移现有视频
3. 配置 CDN 加速
4. 添加视频压缩功能

### 阶段三：专业服务（可选）
1. 如果视频量大，考虑使用视频点播服务
2. 实现自适应码率播放
3. 添加视频转码和优化

---

## 代码实现建议

### 1. 视频上传组件（后台）

```typescript
// admin/src/components/VideoUpload.tsx
async function uploadVideo(file: File): Promise<string> {
  // 方案一：Supabase
  const filePath = `videos/${Date.now()}_${file.name}`
  const { error } = await supabase.storage
    .from('images') // 或创建专门的 videos bucket
    .upload(filePath, file)
  
  if (error) throw error
  
  const { data } = supabase.storage
    .from('images')
    .getPublicUrl(filePath)
  
  return data.publicUrl
}
```

### 2. 视频播放组件（前台）

```html
<!-- 基础播放 -->
<video 
  src="VIDEO_URL" 
  controls 
  preload="metadata"
  class="w-full rounded-lg"
  onerror="handleVideoError()"
>
  您的浏览器不支持视频播放
</video>

<!-- 带缩略图 -->
<video 
  src="VIDEO_URL" 
  poster="THUMBNAIL_URL"
  controls 
  preload="metadata"
>
</video>
```

### 3. 视频压缩（上传前）

```javascript
// 使用 browser-image-compression 或类似库
import imageCompression from 'browser-image-compression'

// 对于视频，可以使用 FFmpeg.wasm
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'

async function compressVideo(file: File): Promise<File> {
  const ffmpeg = createFFmpeg({ log: true })
  await ffmpeg.load()
  
  ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(file))
  await ffmpeg.run('-i', 'input.mp4', '-vcodec', 'libx264', '-crf', '28', 'output.mp4')
  
  const data = ffmpeg.FS('readFile', 'output.mp4')
  return new File([data.buffer], 'compressed.mp4', { type: 'video/mp4' })
}
```

---

## 总结

**对于你的项目进度追踪功能**：

1. **短期方案**：使用 Supabase Storage 存储小视频（< 10MB），适合项目进度更新
2. **长期方案**：迁移到阿里云 OSS 或七牛云，支持更大文件和更好的性能
3. **最佳实践**：
   - 上传前压缩视频
   - 使用 `preload="metadata"` 优化加载
   - 添加加载提示和错误处理
   - 考虑生成视频缩略图

**成本估算**（假设每月 100 个视频，每个 20MB）：
- Supabase：超出免费额度后约 $25/月
- 阿里云 OSS：约 10-20 元/月
- 七牛云：免费额度内（10GB）

建议：**先用 Supabase 快速上线，视频量大后再迁移到云存储服务**。

