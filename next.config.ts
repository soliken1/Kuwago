import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
