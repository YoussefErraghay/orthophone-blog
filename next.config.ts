import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The generated Prisma client and the Postgres driver use Node.js built-ins and
  // must not be bundled by Turbopack for Server Components.
  serverExternalPackages: ["@prisma/adapter-pg", "pg"],

  experimental: {
    serverActions: {
      // Headroom above the app's own upload ceiling (lib/uploads.ts) plus
      // multipart overhead. Note the host caps this independently — Vercel's
      // free tier rejects bodies over ~4.5MB with a 413 before this applies —
      // so raising it alone does not allow larger uploads.
      bodySizeLimit: `${Number(process.env.MAX_UPLOAD_MB ?? 4) + 2}mb`,
    },
  },

  images: {
    // Uploads are served from /media/[id] by a route handler rather than from
    // `public/`, so the optimizer can't fetch them by path. Serve them as-is.
    unoptimized: true,
  },
};

export default nextConfig;
