# Nugraha — Portfolio · Build Spec

Single-page personal portfolio for **Nugraha Kautsarrizqi Caksana** (CS @ Universitas Indonesia).
Goal: **professional and WOW**, with the **AI side front and centre**. It must visibly fuse two of the owner's projects:

| Source | Path | What we take |
|---|---|---|
| **BEM UI company profile** (Next 14, three.js) | `C:\Users\nugra\KULIAH\bemuidev\comprov2\companyprofile` | Navy design system (`app/globals.css`, `tailwind.config.ts`), glass navbar (`components/ui/site-nav.tsx`), **3D hero orbit** (`components/home/HeroOrbit.tsx`, `components/home/orbit/scene.ts` — instanced card ring + atlas + wave shader + cylinder grid), `components/webgl/MeshGradient.tsx` (ogl), `components/kabinet/Cursor.tsx`, `CharRoll.tsx`, `components/home/SmoothScroll.tsx` (Lenis), GSAP text reveals (`lib/project-text-reveal.ts`, `lib/gsap-reveal.ts`) |
| **Hypomonē @HACK** (Next 16, Tailwind v4) | `C:\Users\nugra\KULIAH\Project Compemone\Hypomone @HACK\hackvidia26` | The **geometric pattern language** (quarter-circles, tile clusters, mosaics, puzzle pieces, dot grids — already copied to `src/components/shared/Decorators.tsx`), section rhythm, `SectionHeading`/`Highlight`/`Eyebrow`, `Button`, `Typewriter`, `CountUp`, `Reveal`, infinite marquees, `bg-slant` bands, `docs/design-system.md` |

Read the original files when you port something — don't guess their APIs.

## Stack (already installed — do NOT add packages)

Next.js **16.4.5** (App Router, Turbopack, `output: "export"` static site, `images.unoptimized`), React 19.3, TypeScript strict,
**Tailwind CSS v4** (tokens in `src/app/globals.css` `@theme`, no tailwind.config), `three@0.186` (+ `@types/three`), `gsap@3.15`,
`lenis`, `framer-motion@14`, `ogl`, `lucide-react@1.x` (NO brand icons — use `src/components/shared/SocialIcons.tsx`), `clsx` (`src/lib/cn.ts`).
This Next version has breaking changes vs. your training data: check `node_modules/next/dist/docs/` before using a Next API you are unsure of.

Rules:
- Static export: no server actions, no route handlers, no `headers()/cookies()`, no `next/image` optimisation (use `<img>` or `next/image` with `unoptimized`). **Always wrap public paths with `asset()` from `@/lib/asset`** (GitHub Pages basePath).
- Anything with hooks/three/gsap/window → `"use client"`. Load three.js scenes with `next/dynamic(..., { ssr: false })` or inside `useEffect` so the server HTML never touches `window`.
- `prefers-reduced-motion`: every animation must degrade (static frame, no autoplay loops).
- WebGL: pause the render loop when off-screen (IntersectionObserver) or tab hidden; cap DPR at 2 (1.5 on mobile); dispose geometries/materials/textures/renderer on unmount; provide a non-WebGL fallback.
- Mobile first: must look great at 375px. No horizontal page scroll (`overflow-x: clip` on wide decorative layers).
- Accessibility: semantic headings (one `h1` in hero, `h2` per section), alt text, focus-visible rings, ESC closes modals, decorative layers `aria-hidden`.
- Copy is **English**, confident and specific. **All facts come from `src/data/site.ts` and `src/data/portfolio.ts`.** Never invent rankings, numbers, employers, dates or links. If you need extra copy, write it as descriptive framing, not new claims.
- CSS: prefer Tailwind utilities. For custom CSS create a plain `.css` file inside your own folder and import it from your component (App Router allows global CSS imports from components). Do not edit `src/app/globals.css` unless your brief says you own it. Tailwind v4 gradients are `bg-linear-to-*`. Remember `text-base` = 18px, `text-lg` = 24px, `text-xl` = **64px** (overridden scale — see globals.css); use arbitrary sizes like `text-[15px]` when you need precision.

## Design direction — "Navy Observatory × Geometric Lab"

- **Palette**: deep navy canvases (`bg-navy-950`, `bg-navy-900` #0B102D, `navy-800/700/600`) for Hero, AI Lab, Cosmos and Footer; light canvases (`bg-surface-alt` #F5F6FB, `bg-surface`) for About, Projects, Journey, Contact. Accents: `primary` royal navy-blue #2F4199, `primary-vivid` #5B72E0, `accent-sky` electric blue #4F8BFF, `accent-cyan` #5EE6FF (AI/neural glow), `accent-saffron` starlight gold #F5C04A, `accent-coral` BEM pink #D64C6F, `blue` #475CA3. Text on light: `text-ink` / `text-ink-muted`; on dark: `text-white` / `text-white/60`.
- **Patterns** (the hackvidia style the owner loves): use `Decorators.tsx` pieces (`TileCluster`, `MosaicLeft/Right`, `MoonCorner`, `LeafCorner`, `GhostTiles`, `DotGrid`, `QuarterCircle`, `PuzzlePiece`, `GeoStrip`, `CardDeco`) generously but tastefully in corners and behind cards; they already use the navy-remapped tokens. On dark sections use `GhostTiles`/`DotGrid` with low opacity and `QuarterCircle` in `primary`/`accent-sky`.
- **Type**: Plus Jakarta Sans (`font-sans`) — big, bold, tight display headings (`leading-[1.02] tracking-tight` allowed). **JetBrains Mono** (`font-mono`) for eyebrows / labels / metrics in an AI-terminal voice, e.g. `// 02 — AI LAB`, `> status: shipping`.
- **Section header pattern**: mono eyebrow `// 0N — NAME` + large heading with one `Highlight`ed phrase + one-line lead.
- **Motion**: framer-motion `Reveal` for entrances, GSAP/ScrollTrigger allowed for scroll-linked scenes, Lenis smooth scroll is global (`src/components/layout/SmoothScroll.tsx` exposes `window.__lenis`). Easing `cubic-bezier(0.16,1,0.3,1)`.
- **Glass** (BEM UI recipe): `bg-white/5 backdrop-blur-xl border border-white/10` on dark sections only.
- Cards: `rounded-[28px]` (BEM `r-2xl`) or hackvidia `rounded-[32px]`, soft navy shadows `shadow-[0_20px_50px_-20px_rgba(11,16,45,0.35)]`.

## Page structure (`src/app/page.tsx` — fixed, do not rename exports)

| # | id | Component (default export) | Canvas | Owner |
|---|---|---|---|---|
| 0 | `top` | `sections/hero/Hero.tsx` | dark | hero agent |
| 1 | `about` | `sections/about/About.tsx` | light | about agent |
| 2 | `ai-lab` | `sections/ailab/AiLab.tsx` | dark | about agent |
| 3 | `projects` | `sections/projects/Projects.tsx` | light | projects agent |
| 4 | `cosmos` | `sections/cosmos/Cosmos.tsx` | dark (starry) | cosmos agent |
| 5 | `journey` | `sections/journey/Journey.tsx` | light | journey agent |
| 6 | `contact` | `sections/contact/Contact.tsx` | light → dark footer | shell agent |
| — | layout | `layout/Navbar.tsx`, `layout/Footer.tsx`, `layout/SmoothScroll.tsx`, `layout/Cursor.tsx` | — | shell agent |

Each section is a `<section id="...">` (ids from `SECTION_IDS` in `src/data/site.ts`). The navbar is fixed (~72px), so the hero must account for it.

## Working agreement for parallel agents

- Write ONLY inside your own folder(s) listed in your brief. Shared files (`src/components/shared/*`, `src/data/*`, `src/lib/*`, `src/app/*`) are read-only for you unless your brief says otherwise. If you truly need a shared helper, create it inside your own folder.
- Do NOT run `next build` or `next dev` (other agents share the folder). Verify with `npx tsc --noEmit -p .` and `npx eslint <your files>`; ignore errors that come from other agents' folders.
- Finish with a short report: files created, how it works, anything left rough.

## Cross-section contracts

1. **Navbar theme**: every section root element carries `data-nav-theme="dark"` or `data-nav-theme="light"` matching its canvas. The navbar watches these to switch between dark-glass and light-glass styles.
2. **Open a project from anywhere**: `window.dispatchEvent(new CustomEvent("portfolio:open-project", { detail: { slug } }))`. The Projects section listens and opens its detail modal (scrolling to `#projects` first is the dispatcher's choice). Hero orbit cards use this.
3. **Smooth scroll**: `SmoothScroll` stores the Lenis instance on `window.__lenis` (type it locally as `(window as unknown as { __lenis?: { stop(): void; start(): void; scrollTo(t: string | number | HTMLElement, o?: object): void } }).__lenis`). Modals call `stop()` / `start()`. GSAP ScrollTrigger is synced to Lenis by SmoothScroll — if you use ScrollTrigger just `gsap.registerPlugin(ScrollTrigger)`.
4. **Focus a constellation**: the Cosmos section owns its own state; no external contract.
