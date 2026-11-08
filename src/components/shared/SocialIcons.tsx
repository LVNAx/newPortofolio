import type { SocialKey } from "@/data/site";

/**
 * Simple monochrome social glyphs (original drawings, currentColor).
 * Covers every `SocialKey` in src/data/site.ts.
 */
export default function SocialIcon({
  name,
  className = "h-6 w-6",
}: {
  name: SocialKey;
  className?: string;
}) {
  const common = {
    viewBox: "0 0 24 24",
    className,
    "aria-hidden": true,
    fill: "currentColor",
  } as const;

  switch (name) {
    case "github":
      return (
        <svg {...common}>
          <path d="M12 2.2a9.9 9.9 0 0 0-3.13 19.3c.5.09.68-.21.68-.48v-1.7c-2.78.6-3.37-1.2-3.37-1.2-.45-1.16-1.1-1.47-1.1-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03a9.5 9.5 0 0 1 5 0c1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.85-2.34 4.7-4.57 4.94.36.31.68.92.68 1.86v2.75c0 .27.18.58.69.48A9.9 9.9 0 0 0 12 2.2Z" />
        </svg>
      );
    case "kaggle":
      // original "k" glyph: stem + two wedges, in the same weight as the others
      return (
        <svg {...common}>
          <rect x="5" y="2.5" width="3.6" height="19" rx="1" />
          <path d="M9.4 12.4 16 4.2h4.3l-6.7 8.1Z" />
          <path d="M11.5 11.7 13.6 10l7.2 11.5h-4.4Z" />
        </svg>
      );
    case "email":
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="3" />
          <path d="m4 7 8 6 8-6" strokeLinecap="round" />
        </svg>
      );
    case "resume":
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round">
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
          <path d="M14 3v5h5" />
          <path d="M9 13h6M9 17h4" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth={2}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      );
    case "x":
      return (
        <svg {...common}>
          <path d="M3.5 3h4.6l4.3 5.9L17.6 3h2.6l-6.6 7.6L21 21h-4.6l-4.7-6.4L6.1 21H3.5l7-8L3.5 3Zm3.7 1.6 10 14h1.5l-10-14H7.2Z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg {...common}>
          <path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm2.2 7.2V18h2.6v-7.8H6.2Zm1.3-4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm3.2 4V18h2.6v-4.1c0-1.1.4-1.9 1.5-1.9s1.4.8 1.4 1.9V18h2.6v-4.7c0-2.3-1.2-3.3-2.9-3.3-1.3 0-2.1.6-2.6 1.3v-1.1h-2.6Z" />
        </svg>
      );
    case "line":
      return (
        <svg {...common}>
          <path d="M12 3C6.5 3 2 6.6 2 11c0 3.9 3.5 7.2 8.3 7.9.3.1.8.2.9.5.1.3 0 .7 0 1l-.1.9c0 .3-.2 1 .9.5 1.1-.5 5.9-3.5 8.1-6A6.9 6.9 0 0 0 22 11c0-4.4-4.5-8-10-8Zm-4.6 10.5H5.6a.5.5 0 0 1-.5-.5V9a.5.5 0 0 1 1 0v3.5h1.3a.5.5 0 0 1 0 1Zm2 -.5a.5.5 0 0 1-1 0V9a.5.5 0 0 1 1 0v4Zm4.6 0a.5.5 0 0 1-.9.3l-1.9-2.5V13a.5.5 0 0 1-1 0V9a.5.5 0 0 1 .9-.3l1.9 2.5V9a.5.5 0 0 1 1 0v4Zm3.2-2.5a.5.5 0 0 1 0 1h-1.3v1h1.3a.5.5 0 0 1 0 1h-1.8a.5.5 0 0 1-.5-.5V9a.5.5 0 0 1 .5-.5h1.8a.5.5 0 0 1 0 1h-1.3v1h1.3Z" />
        </svg>
      );
    case "spotify":
      return (
        <svg {...common}>
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.3 14.4a.7.7 0 0 1-1 .2c-2.6-1.6-5.9-2-9.8-1.1a.7.7 0 1 1-.3-1.4c4.2-1 7.9-.5 10.8 1.3.3.2.4.7.3 1Zm1.3-3a.9.9 0 0 1-1.2.3c-3-1.8-7.5-2.4-11-1.3a.9.9 0 1 1-.5-1.7c4-1.2 9-.6 12.4 1.5.4.2.5.8.3 1.2Zm.1-3.1C14.2 8.2 8.4 8 5 9a1 1 0 1 1-.6-2c3.9-1.2 10.3-1 14.3 1.4a1 1 0 0 1-1 1.8Z" />
        </svg>
      );
    case "medium":
      return (
        <svg {...common}>
          <ellipse cx="7" cy="12" rx="5" ry="5.5" />
          <ellipse cx="15.5" cy="12" rx="2.5" ry="5.2" />
          <ellipse cx="20.5" cy="12" rx="1" ry="4.6" />
        </svg>
      );
  }
}
