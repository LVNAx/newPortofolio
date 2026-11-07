import path from "node:path";
import type { NextConfig } from "next";

/**
 * Static export so the site can be hosted anywhere (Vercel, GitHub Pages, Netlify).
 * Set NEXT_PUBLIC_BASE_PATH="/newPortofolio" when deploying to GitHub Pages project URLs.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: basePath || undefined,
  images: { unoptimized: true },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
