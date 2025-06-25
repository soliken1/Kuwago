import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    STREAM_API_KEY: process.env.STREAM_API_KEY,
    STREAM_SECRET_KEY: process.env.STREAM_SECRET_KEY,
    PANDADOC_API_KEY: process.env.PANDADOC_API_KEY,
    PANDADOC_WEBHOOK_KEY: process.env.PANDADOC_WEBHOOK_KEY,
    PANDADOC_TEMPLATE_ID: process.env.PANDADOC_TEMPLATE_ID,
  },
  images: {
    domains: ["i.pinimg.com"],
    remotePatterns: [new URL("https://res.cloudinary.com/**")],
  },
  async rewrites() {
    return [
      {
        source: "/proxy/:path*",
        destination: "http://kuwagoapi.somee.com/api/:path*",
      },
    ];
  },
};

export default nextConfig;
