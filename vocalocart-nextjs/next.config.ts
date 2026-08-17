import type { NextConfig } from "next";
import path from "path";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // A stray lockfile outside this repo (e.g. C:\Users\<you>\package-lock.json)
  // makes Turbopack infer the wrong workspace root, which intermittently
  // fails to resolve deps like `tailwindcss`. Pin the root explicitly.
  turbopack: {
    root: path.resolve(__dirname),
  },
  serverExternalPackages: [
    '@prisma/client',
    '@prisma/adapter-pg',
    'pg',
    'resend',
    'svix',
    'bcryptjs',
  ],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default withNextIntl(nextConfig);

