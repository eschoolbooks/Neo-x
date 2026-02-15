import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      // Allow Supabase storage domains
      process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', '') || '',
    ].filter(Boolean),
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '15mb', // Allow larger uploads
    },
  },
};

export default nextConfig;
