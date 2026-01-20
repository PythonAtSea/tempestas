import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_COMMIT_SHA: process.env.WORKERS_CI_COMMIT_SHA || "",
  },
};

export default nextConfig;
