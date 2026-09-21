import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Images will later point at Supabase Storage (Phase 3+)
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
