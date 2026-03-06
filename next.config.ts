import type { NextConfig } from "next";

const externalApiUrl = process.env.EXTERNAL_API_URL?.replace(/\/$/, "");
const appMode = process.env.APP_MODE ?? "web";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
  experimental: {
    serverActions: {
      allowedOrigins: process.env.NODE_ENV === "production"
        ? ["campo-saas.vercel.app", "www.saderh.gob.mx"]
        : ["localhost:3000", "localhost:3001"],
    },
    optimizeCss: true,
    optimizePackageImports: ["lucide-react", "recharts", "date-fns"],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        ],
      },
    ];
  },
  async rewrites() {
    if (appMode === "web" && externalApiUrl) {
      return {
        beforeFiles: [
          // Keep local auth/reset endpoints in this Next.js app.
          {
            source: "/api/auth/:path*",
            destination: "/api/auth/:path*",
          },
          {
            source: "/api/validate-reset-token",
            destination: "/api/validate-reset-token",
          },
          {
            source: "/api/:path*",
            destination: `${externalApiUrl}/api/:path*`,
          },
        ],
        afterFiles: [],
        fallback: [],
      };
    }

    return [];
  },
};

export default nextConfig;
