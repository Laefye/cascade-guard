import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
};

console.log("Next.js basePath:", nextConfig.basePath);

export default nextConfig;
