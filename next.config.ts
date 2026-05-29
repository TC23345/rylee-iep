import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Keep the native MongoDB driver out of the bundle; it runs server-side only.
  serverExternalPackages: ["mongodb"],
  // Pin the app root because this Windows profile has another pnpm lockfile above
  // the project directory, which makes Next infer the wrong tracing root.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
