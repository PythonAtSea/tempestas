import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_COMMIT_SHA: process.env.CF_PAGES_COMMIT_SHA || "",
  },
};

export default nextConfig;
