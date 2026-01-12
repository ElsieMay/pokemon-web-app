import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        { key: "X-DNS-Prefetch-Control", value: "on" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "X-Content-Type-Options", value: "nosniff" },
      ],
    },
  ],
};

export default nextConfig;
