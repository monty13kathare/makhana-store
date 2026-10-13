import type { NextConfig } from "next";

/** Where `/api/v1/*` on this site is proxied to (see NEXT_PUBLIC_API_URL in .env). */
const backendApiUrl = (process.env.API_URL || "http://localhost:4000/api/v1").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Browser requests go through this site (same origin), so they work
        // regardless of the backend's CORS_ORIGINS and keep the refresh cookie first-party.
        source: "/api/v1/:path*",
        destination: `${backendApiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
