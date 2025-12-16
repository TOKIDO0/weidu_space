import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 修复 Next.js 15 的 searchParams/params Promise 警告
  experimental: {
    // 如果使用 Next.js 15，这些选项可以帮助
  },
  // 确保静态文件能正确服务
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
