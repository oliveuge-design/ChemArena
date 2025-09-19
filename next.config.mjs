/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Performance ottimizzazioni
  swcMinify: true,
  experimental: {
    optimizeCss: true,
  },

  // Compress responses per Render
  compress: true,

  eslint: {
    // Disable ESLint during builds for deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip TypeScript checks during builds
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
    // Optimize image loading
    formats: ['image/webp', 'image/avif'],
  },

  // Headers per security e performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },

  env: {
    WEBSOCKET_PUBLIC_URL: process.env.WEBSOCKET_PUBLIC_URL,
  },
}

export default nextConfig
