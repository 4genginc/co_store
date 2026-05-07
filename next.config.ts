import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rfpga.s3.us-west-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "jizwzssftlqosluclmpd.supabase.co",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
};

export default nextConfig;
