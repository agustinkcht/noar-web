import type { NextConfig } from "next";

// Export estático: `npm run build` genera la carpeta `out/`, que se puede
// subir a cualquier hosting (Vercel, Netlify, Hostinger, etc.).
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
