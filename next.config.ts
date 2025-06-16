import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    STREAM_API_KEY: process.env.STREAM_API_KEY,
    STREAM_SECRET_KEY: process.env.STREAM_SECRET_KEY,
    DOCUSIGN_INTEGRATION_KEY: process.env.DOCUSIGN_INTEGRATION_KEY,
    DOCUSIGN_USER_ID: process.env.DOCUSIGN_USER_ID,
    DOCUSIGN_ACCOUNT_ID: process.env.DOCUSIGN_ACCOUNT_ID,
    DOCUSIGN_BASE_PATH: process.env.DOCUSIGN_BASE_PATH,
    DOCUSIGN_PRIVATE_KEY_FILE: process.env.DOCUSIGN_PRIVATE_KEY_FILE,
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
