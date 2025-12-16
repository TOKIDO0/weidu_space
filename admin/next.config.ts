import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 修复 Next.js 15 的 searchParams/params Promise 警告
  experimental: {
    // 如果使用 Next.js 15，这些选项可以帮助
  },
  // 配置重写规则，让静态HTML文件可以通过Next.js服务
  async rewrites() {
    return [
      {
        source: '/index.html',
        destination: '/',
      },
    ];
  },
};

export default nextConfig;
