import type { NextConfig } from "next";

// `/api/v1/*` is proxied to the backend by src/app/api/v1/[...path]/route.ts,
// which reads API_URL at request time. Don't add a rewrite for it here:
// rewrites are fixed at startup/build, so changing API_URL would need a rebuild.
const nextConfig: NextConfig = {};

export default nextConfig;
