/** Prefix a /public path with the configured basePath (needed for GitHub Pages project URLs). */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
export const asset = (p: string) => `${BASE_PATH}${p.startsWith("/") ? p : `/${p}`}`;
