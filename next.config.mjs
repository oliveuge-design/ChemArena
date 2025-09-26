/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Disable ESLint during builds for deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip TypeScript checks during builds
    ignoreBuildErrors: true,
  },
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: false,

  // Bundle analyzer in development
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer')({
          enabled: true,
        }))()
      )
      return config
    },
  }),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  env: {
    WEBSOCKET_PUBLIC_URL: process.env.WEBSOCKET_PUBLIC_URL,
  },
}

export default nextConfig
