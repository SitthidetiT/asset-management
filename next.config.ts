import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/dashboard/measuring',
        destination: '/dashboard/assets',
        permanent: true,
      },
      {
        source: '/dashboard/machines',
        destination: '/dashboard/assets',
        permanent: true,
      },
      {
        source: '/dashboard/it',
        destination: '/dashboard/assets',
        permanent: true,
      },
      {
        source: '/dashboard/repairs',
        destination: '/dashboard/maintenance',
        permanent: true,
      },
      {
        source: '/dashboard/audit',
        destination: '/dashboard/audits',
        permanent: true,
      },
      {
        source: '/dashboard/reports',
        destination: '/dashboard',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
