import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  serverExternalPackages: [
    "@prisma/client",
    "prisma",
    "playwright",
    "playwright-core",
    "@axe-core/playwright",
    "axe-core",
  ],
};

export default nextConfig;
