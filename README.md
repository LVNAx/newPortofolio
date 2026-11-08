# Nugraha — Portfolio

Personal portfolio of **Nugraha Kautsarrizqi Caksana** — Computer Science @ Universitas Indonesia,
building AI that acts: agents, models and the products around them.

A single-page, statically exported site with the AI work front and centre, a WebGL hero,
a starry-night "Cosmos" section with explorable constellations (a nod to the provincial
OSN Astronomy podium), and a geometric pattern language throughout.

## Two design systems, one site

The site deliberately fuses two of the owner's own projects:

| Source | What it contributes |
| --- | --- |
| **BEM UI 2026 company profile** (Next 14 · three.js) | The navy palette, floating glass navbar, 3D orbit hero ideas, Lenis smooth scroll, the dot + ring cursor and GSAP text reveals |
| **Hypomonē @HACK** (Next 16 · Tailwind v4) | The geometric pattern language — quarter-circles, tile clusters, mosaics, GeoStrips, dot grids — plus section rhythm, headings, buttons, counters and marquees |

The result is **"Navy Observatory × Geometric Lab"**: deep navy canvases for the hero, AI Lab,
Cosmos and footer; light canvases for About, Projects, Journey and Contact; Plus Jakarta Sans
display type throughout, with small tracked labels for eyebrows and metadata (JetBrains Mono is kept only for real code).

## Sections

| # | Anchor | Section |
| --- | --- | --- |
| 0 | `#top` | Hero — 3D orbit of project cards |
| 1 | `#about` | About |
| 2 | `#ai-lab` | AI Lab — agents, ML and data work |
| 3 | `#projects` | Projects — filterable grid with detail modals |
| 4 | `#cosmos` | Cosmos — starry night with 3D constellations |
| 5 | `#journey` | Journey — education, experience, achievements |
| 6 | `#contact` | Contact — copy-to-clipboard email, socials, mailto composer |

Global shell: glass navbar with active-section pill and scroll progress, full-screen mobile menu,
Lenis smooth scroll synced to GSAP ScrollTrigger, custom cursor (fine pointers only) and the
navy footer.

## Tech

- **Next.js 16** (App Router, Turbopack) with `output: "export"` — a fully static site
- **React 19**, **TypeScript** (strict)
- **Tailwind CSS v4** — design tokens live in `src/app/globals.css` (`@theme`)
- **three.js** and **ogl** for WebGL, **GSAP** + ScrollTrigger, **Lenis**, **framer-motion**
- `lucide-react` for UI icons; brand glyphs are hand-drawn in `src/components/shared/SocialIcons.tsx`

Every animation respects `prefers-reduced-motion`; WebGL scenes pause off-screen and fall back
gracefully when WebGL is unavailable.

## Getting started

Requires Node.js 20+ (CI uses Node 22).

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export → out/
npm run start      # serve out/ locally
npm run typecheck  # tsc --noEmit
npm run lint
```

## Where the content lives

All copy and facts come from two files — edit these, not the components:

- `src/data/site.ts` — name, role, bio, email, résumé link, socials, nav links, section ids
- `src/data/portfolio.ts` — projects, achievements, experience, journey, skills, stats

Images go in `public/images/…` and must be referenced through `asset()` from `src/lib/asset.ts`
so they resolve under a GitHub Pages base path.

```
src/
├─ app/                 layout, page, globals.css (tokens)
├─ components/
│  ├─ layout/           Navbar, Footer, SmoothScroll, Cursor
│  ├─ sections/         hero · about · ailab · projects · cosmos · journey · contact
│  └─ shared/           Decorators (pattern tiles), Button, Reveal, SectionHeading, …
├─ data/                site.ts, portfolio.ts
└─ lib/                 asset(), cn()
```

## Deployment

The build output in `out/` is plain static files, so it can be hosted anywhere.

### Vercel

Import the repository — Vercel detects Next.js and serves the static export. No base path
or environment variables are needed.

### GitHub Pages

`.github/workflows/deploy.yml` builds and publishes on every push to `main` (or manually via
*Run workflow*):

1. In the repository go to **Settings → Pages** and set **Source** to **GitHub Actions**.
2. Push to `main`. The workflow runs `npm ci`, then `npm run build` with
   `NEXT_PUBLIC_BASE_PATH=/newPortofolio`, adds `.nojekyll` and deploys `out/`.

The site is then served at `https://<user>.github.io/newPortofolio/`. If you rename the
repository, update `NEXT_PUBLIC_BASE_PATH` in the workflow to match. To preview the Pages build
locally:

```bash
NEXT_PUBLIC_BASE_PATH=/newPortofolio npm run build
```

---

Designed & built by Nugraha · Next.js · three.js · GSAP · © 2026
