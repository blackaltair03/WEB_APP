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
  async rewrites() {
    if (appMode === "web" && externalApiUrl) {
      return {
        beforeFiles: [
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
