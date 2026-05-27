import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Keep the native MongoDB driver out of the bundle; it runs server-side only.
  serverExternalPackages: ["mongodb"],
  // Pin the workspace root to this app dir. Without it, Next walks up to a stray
  // ~/pnpm-lock.yaml and traces the whole home directory.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
