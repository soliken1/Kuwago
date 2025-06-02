import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["i.pinimg.com"], // ✅ Add the domain here
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
