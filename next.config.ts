import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The generated Prisma client and the MariaDB driver use Node.js built-ins and
  // must not be bundled by Turbopack for Server Components.
  serverExternalPackages: ["@prisma/adapter-mariadb", "mariadb"],

  experimental: {
    serverActions: {
      // Cover image (4MB) + PDF (10MB) can be submitted in one form, plus
      // multipart overhead. Keep headroom above the sum of both limits.
      bodySizeLimit: "16mb",
    },
  },

  images: {
    // Uploads are served from /media/[id] by a route handler rather than from
    // `public/`, so the optimizer can't fetch them by path. Serve them as-is.
    unoptimized: true,
  },
};

export default nextConfig;
