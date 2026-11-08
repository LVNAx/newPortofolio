/**
 * Portfolio content. Every fact here comes from the owner's own material:
 * PBP myPortofolio DB (projects / journey / experience), project READMEs
 * (WASKITA, EJA, Hypomonē @LV, BEM UI compro, Hypomonē @HACK, LOGIKA 26 notes).
 * Do NOT invent numbers, rankings, employers or links — extend this file instead.
 */

export type ProjectCategory = "agents" | "ml" | "web";

export type Project = {
  slug: string;
  title: string;
  tagline: string;
  /** Event / context the project was built for. */
  context: string;
  year: string;
  role: string;
  category: ProjectCategory;
  /** Flagship AI projects get the large showcase treatment. */
  featured?: boolean;
  description: string;
  highlights: string[];
  /** Short headline metric for cards, e.g. "F1 99.57". Optional. */
  metric?: { value: string; label: string };
  stack: string[];
  image?: string;
  /** Brand colour for generated covers / glows (hex). */
  accent: string;
  links?: { label: string; href: string }[];
};

export const projectCategories: { key: ProjectCategory | "all"; label: string }[] = [
  { key: "all", label: "All work" },
  { key: "agents", label: "AI Agents & Systems" },
  { key: "ml", label: "Machine Learning & Data" },
  { key: "web", label: "Web & 3D Products" },
];

export const projects: Project[] = [
  {
    slug: "waskita",
    title: "WASKITA",
    tagline: "An AI agent that runs a small factory's electricity bill for it.",
    context: "UNS Innovation Hackathon 2026 · Energy track · our latest competition build",
    year: "2026",
    role: "AI & Backend Engineer",
    category: "agents",
    featured: true,
    description:
      "End-to-end energy copilot for Indonesian MSMEs (UMKM): an ESP32 smart meter streams power telemetry, NILM disaggregates it into individual machines, a digital twin simulates the shop, and a scheduling agent shifts machine runs out of peak tariff hours — then explains the savings over WhatsApp.",
    highlights: [
      "Gymnasium environment with action masking so a MaskablePPO policy can never break a production deadline; OR-Tools CP-SAT as the always-on baseline",
      "Non-intrusive load monitoring (NILM) turns one meter into per-appliance energy ledgers",
      "Digital twin + weather model drives solar-PV (PLTS) and battery sizing after the agent's schedule",
      "WhatsApp agent with OTP-verified numbers sends weekly bills and a PDF 'energy report card'",
      "Role-based dashboards for UMKM owners, local government, installers and banks with explicit data-sharing consent",
    ],
    metric: { value: "96", label: "15-min slots optimised daily" },
    stack: ["Python", "FastAPI", "Stable-Baselines3", "OR-Tools", "Gymnasium", "SQLAlchemy", "Next.js", "ESP32", "WhatsApp API"],
    image: "/images/projects/waskita.jpg",
    accent: "#f5c04a",
    links: [{ label: "Live", href: "https://waskita-webapp.vercel.app/" }],
  },
  {
    slug: "eja",
    title: "EJA",
    tagline: "Game-based dyslexia screening and learning for Indonesian kids — 1st place at JOINTS UGM.",
    context: "JOINTS UGM 2026 Hackathon · 1st place",
    year: "2026",
    role: "Full-Stack Engineer",
    category: "web",
    featured: true,
    description:
      "Learning ecosystem for elementary-age children with dyslexia: playful screening activities (sounds, reading, rapid naming, dictation), plain-language guidance for parents with AI-generated explanations, and a dashboard to follow progress.",
    highlights: [
      "1st place — JOINTS UGM 2026 Hackathon",
      "Four-activity screening flow run together with a companion, framed as a screening aid — never a diagnosis",
      "AI-written explanations of companion advice via Groq",
      "Supabase with row-level security and a vitest test suite",
    ],
    metric: { value: "1st", label: "JOINTS UGM 2026" },
    stack: ["Next.js", "TypeScript", "Supabase", "Groq", "Tailwind CSS", "Vitest"],
    accent: "#f5c04a",
    links: [{ label: "GitHub", href: "https://github.com/LVNAx/EJA" }],
  },
  {
    slug: "foundros",
    title: "FoundrOS",
    tagline: "A multi-agent operating system for founders — agents that act, not advise.",
    context: "OpenClaw Agenthon Build Club × RISTEK Fasilkom UI",
    year: "2026",
    role: "AI Agent Implementer",
    category: "agents",
    description:
      "Autonomous multi-agent system that runs day-to-day operations for MSMEs and startups. Each agent owns a job — sourcing vendors, watching stock, paying suppliers — and executes it end to end through a Telegram interface.",
    highlights: [
      "Map-based vendor-search agent powered by Repliz",
      "Automatic POS stock alerts the moment inventory falls below 20%",
      "Supplier payments wired through DOKU, approved from Telegram",
    ],
    metric: { value: "3+", label: "autonomous agents" },
    stack: ["Python", "OpenClaw", "LLM Agents", "Telegram Bot API", "DOKU"],
    image: "/images/projects/foundros.jpg",
    accent: "#5ee6ff",
    links: [
      {
        label: "Devpost",
        href: "https://devpost.com/software/foundros-ai-sistem-operasional-multi-agent-untuk-startup",
      },
    ],
  },
  {
    slug: "bdc-waste",
    title: "Multiclass Waste Classifier",
    tagline: "Foundation-model features, tiny heads, near-perfect F1.",
    context: "Big Data Challenge · Satria Data 2026",
    year: "2026",
    role: "Machine Learning Engineer",
    category: "ml",
    featured: true,
    description:
      "Image classifier that sorts waste into recyclable, organic and electronic classes. Instead of fine-tuning, frozen vision foundation models extract embeddings and lightweight heads compete on top — fast to train, hard to overfit.",
    highlights: [
      "Frozen DINOv2 and SigLIP backbones as feature extractors",
      "Benchmarked Logistic Regression, kNN and MLP classification heads",
      "F1 score of 99.5695 on the test set — top 70 nationally",
    ],
    metric: { value: "99.57", label: "test F1" },
    stack: ["Python", "PyTorch", "DINOv2", "SigLIP", "scikit-learn"],
    image: "/images/projects/bdc.jpg",
    accent: "#4f8bff",
  },
  {
    slug: "logika-default-risk",
    title: "12-Month Default Risk",
    tagline: "Ranking 30,000 loan applicants by who will hit 90 days past due.",
    context: "LOGIKA UI 2026 · Data Science Competition · Top 10",
    year: "2026",
    role: "Data Scientist",
    category: "ml",
    description:
      "Credit-risk model over six relational tables (profiles, past applications, repayments, account behaviour, bureau data, e-commerce) for 70k training applicants. Every feature is point-in-time safe and every iteration is gated by an honest out-of-fold significance test before it may replace the incumbent.",
    highlights: [
      "Leak-free feature engineering capped at each application's decision timestamp",
      "LightGBM, TabPFN stacking and RealMLP / TabM neural models in the ensemble",
      "Promotion rule: a new submission only ships when it beats the reference with z > 2",
      "Best public-leaderboard KS of 0.571",
      "Finished in the top 10 of the final leaderboard as team Hypomonē",
    ],
    metric: { value: "Top 10", label: "LOGIKA UI 2026" },
    stack: ["Python", "LightGBM", "TabPFN", "PyTorch", "pandas", "Kaggle"],
    accent: "#d64c6f",
  },
  {
    slug: "ispu-forecasting",
    title: "ISPU Air-Quality Forecasting",
    tagline: "Forecasting Indonesia's air-pollution index from its own history.",
    context: "Datavidia 2026",
    year: "2026",
    role: "Data Scientist",
    category: "ml",
    description:
      "Predictive model for the Indonesian air-pollution standard index (ISPU), from cleaning noisy station time series to evaluating forecasts on the qualification split. Finished in the top 38.",
    highlights: [
      "Cleaned and restructured ISPU station data into model-ready time series",
      "Trained and compared machine-learning models for pollution levels",
      "Top 38 at Datavidia 2026",
    ],
    metric: { value: "Top 38", label: "Datavidia 2026" },
    stack: ["Python", "pandas", "scikit-learn", "Time Series"],
    image: "/images/projects/ispu.png",
    accent: "#9cb3d3",
  },
  {
    slug: "mbgmeter",
    title: "MBGMeter",
    tagline: "Early-warning dashboard for Indonesia's free school-meal programme.",
    context: "Public-service product",
    year: "2026",
    role: "Frontend Engineer",
    category: "web",
    description:
      "Platform that tracks student perception and food waste in the Makan Bergizi Gratis programme for schools and kitchens (SPPG), surfacing clusters of food-safety complaints before they spread.",
    highlights: [
      "Three role-based dashboards: students, kitchens (SPPG) and stakeholders",
      "Early-warning clustering of food-safety complaints",
      "Hand-written SVG data visualisations — no chart library",
    ],
    stack: ["React", "TypeScript", "Vite", "Vercel"],
    image: "/images/projects/mbgmeter.jpg",
    accent: "#4f8bff",
    links: [{ label: "Live", href: "https://mbgmeter.vercel.app" }],
  },
  {
    slug: "hypomone-lv",
    title: "Hypomonē @LV",
    tagline: "My semester, run like a mission control — with a 3D Andromeda in the middle.",
    context: "Personal product · successor of Sandbox",
    year: "2026",
    role: "Full-Stack Developer",
    category: "web",
    description:
      "Academic and daily-life monitoring app that maps five course syllabi onto a 17-week calendar with per-component grade calculators, daily email briefings, OCR receipt scanning for finances and a first-person 3D focus room.",
    highlights: [
      "3D orbit hero: a particle Andromeda galaxy circled by live course cards",
      "Supabase realtime sync between laptop and phone, still works offline",
      "Receipt scanning with Tesseract.js (optional Claude API fallback)",
      "Scheduled email digests with Resend; hand-written service-worker PWA",
    ],
    stack: ["Next.js", "three.js", "GSAP", "Supabase", "Tesseract.js", "Claude API", "Resend"],
    image: "/images/projects/hypomone-lv.jpg",
    accent: "#d64c6f",
    links: [
      { label: "Live", href: "https://hypomoneatlv.vercel.app/" },
      { label: "Sandbox (v1)", href: "https://lvnasandbox.vercel.app" },
    ],
  },
  {
    slug: "bem-ui",
    title: "BEM UI 2026 Website",
    tagline: "The student executive board's home, with a 3D orbit of programmes.",
    context: "BEM UI · Kabinet TerusTerang",
    year: "2026",
    role: "Staff of Multimedia",
    category: "web",
    description:
      "Official website of Universitas Indonesia's student executive board. The home hero is a three.js scene: a 3D-extruded logo wrapped by rings of programme cards that wave with scroll, fly to centre on click and morph into division details.",
    highlights: [
      "Single WebGL context: instanced cards + texture atlas in one draw call",
      "GSAP + Lenis motion, render loop paused off-screen",
      "Data from the internal CMS (SIT) API with static JSON fallback",
    ],
    stack: ["Next.js", "three.js", "GSAP", "Lenis", "OGL", "Tailwind CSS", "Railway"],
    image: "/images/projects/bemui.jpg",
    accent: "#475ca3",
    links: [{ label: "Live", href: "https://bemui.site" }],
  },
  {
    slug: "hypomone-hack",
    title: "Hypomonē @HACK",
    tagline: "A home for a student hackathon community that keeps going.",
    context: "Community website",
    year: "2026",
    role: "Frontend Engineer",
    category: "web",
    description:
      "Four-page site for a student-run tech and hackathon community, built on a token-driven design system with a four-colour geometric tile language — the same pattern language this portfolio is dressed in.",
    highlights: [
      "Original geometric decorator set (tiles, quarter-circles, mosaics)",
      "Typewriter hero, infinite marquees and event modals",
      "Next.js 16 with Cache Components and Tailwind CSS v4 tokens",
    ],
    stack: ["Next.js 16", "React 19", "Tailwind CSS v4", "Framer Motion", "Swiper"],
    accent: "#2f4199",
  },
];

/* ------------------------------------------------------------------ */

export type Achievement = {
  title: string;
  event: string;
  level: string;
  year?: string;
  /** Which stage of life it belongs to. */
  stage: "SMP" | "SMA" | "University";
  kind: "olympiad" | "ai" | "data" | "academic";
  /** Constellation this achievement is pinned to in the Cosmos section. */
  constellation: string;
  note: string;
};

export const achievements: Achievement[] = [
  {
    title: "1st Place",
    event: "JOINTS UGM Hackathon",
    level: "National",
    year: "2026",
    stage: "University",
    kind: "ai",
    constellation: "Aquila",
    note: "EJA — game-based dyslexia screening and learning for Indonesian kids, with AI-written guidance for parents.",
  },
  {
    title: "3rd Place",
    event: "National Science Olympiad (OSN) — Astronomy",
    level: "Provincial · West Kalimantan",
    stage: "SMA",
    kind: "olympiad",
    constellation: "Orion",
    note: "Celestial mechanics, stellar physics and sky reading — the night sky is where my love for patterns started.",
  },
  {
    title: "Top 10",
    event: "ASN Digital AI Hackathon",
    level: "National",
    year: "2025",
    stage: "University",
    kind: "ai",
    constellation: "Crux",
    note: "National AI hackathon — top 10 teams.",
  },
  {
    title: "Top 10",
    event: "LOGIKA UI · Data Science Competition",
    level: "National",
    year: "2026",
    stage: "University",
    kind: "data",
    constellation: "Gemini",
    note: "12-month default-risk model over six relational tables, as team Hypomonē.",
  },
  {
    title: "Top 70",
    event: "Big Data Challenge · Satria Data",
    level: "National",
    year: "2026",
    stage: "University",
    kind: "ai",
    constellation: "Scorpius",
    note: "Waste-image classifier on frozen DINOv2 + SigLIP features, F1 99.57.",
  },
  {
    title: "Top 38",
    event: "Datavidia",
    level: "National",
    year: "2026",
    stage: "University",
    kind: "data",
    constellation: "Lyra",
    note: "ISPU air-pollution forecasting.",
  },
  {
    title: "Top 58",
    event: "Datathon",
    level: "National",
    year: "2026",
    stage: "University",
    kind: "data",
    constellation: "Cygnus",
    note: "Data-science competition.",
  },
  {
    title: "3rd Place",
    event: "Physics Quiz Bowl · FMIPA Universitas Tanjungpura",
    level: "Regional",
    stage: "SMA",
    kind: "olympiad",
    constellation: "Ursa Major",
    note: "Rapid-fire physics problem solving.",
  },
  {
    title: "Bronze Medal",
    event: "Fermat Competition",
    level: "International · Mathematics",
    stage: "SMP",
    kind: "olympiad",
    constellation: "Cassiopeia",
    note: "International mathematics competition.",
  },
  {
    title: "Valedictorian",
    event: "SMP Islam Al Azhar 17 Pontianak",
    level: "School",
    stage: "SMP",
    kind: "academic",
    constellation: "Leo",
    note: "Ranked 1st in both school-exam and report-card scores across the cohort.",
  },
];

/* ------------------------------------------------------------------ */

export type Experience = {
  title: string;
  org: string;
  period: string;
  type: string;
  logo?: string;
  points: string[];
};

export const experiences: Experience[] = [
  {
    title: "Staff of Multimedia",
    org: "BEM Universitas Indonesia",
    period: "Apr 2026 — Present",
    type: "Organisation",
    logo: "/images/logos/bemui.png",
    points: [
      "Engineer and maintain BEM UI's core digital ecosystem: the main portal, the Open Recruitment System (SPT) and the Internal Integrated System (SIT).",
      "Administer and improve web utilities including bemui.link.",
      "Turn requirements from cross-functional divisions into scalable, production-ready tools.",
    ],
  },
  {
    title: "Technical Staff · AI Innovation Challenge",
    org: "COMPFEST",
    period: "Apr 2026 — Present",
    type: "Committee",
    logo: "/images/logos/compfest.jpg",
    points: [
      "Keep the registration, submission and coordination platforms of the AI Innovation Challenge running smoothly.",
      "Set up and maintain infrastructure for the competition workflow, from participant onboarding to final judging.",
    ],
  },
  {
    title: "Teaching Assistant · Linear Algebra (International Class)",
    org: "Faculty of Computer Science, Universitas Indonesia",
    period: "Aug 2026 — Present",
    type: "Teaching",
    logo: "/images/logos/fasilkom.jpg",
    points: [
      "Lead weekly tutorials on vector spaces, eigenvalues and matrix transformations for an international cohort.",
      "Grade assignments and exams with detailed feedback; hold consultation hours.",
      "Co-design supplementary practice material with the lecturer before midterms and finals.",
    ],
  },
];

/* ------------------------------------------------------------------ */

export type JourneyStage = {
  name: string;
  school: string;
  period: string;
  photo: string;
  logo: string;
  tags: string[];
  story: string;
  milestones: string[];
};

export const journey: JourneyStage[] = [
  {
    name: "Junior High",
    school: "SMP Islam Al Azhar 17 Pontianak",
    period: "2019 — 2022",
    photo: "/images/journey/smp.jpg",
    logo: "/images/logos/alazhar.png",
    tags: ["disciplined", "competitive", "consistent"],
    story:
      "Started right before the pandemic reshaped everything. The lesson that stuck: no one will save you except yourself. Graduated as valedictorian.",
    milestones: ["Bronze Medal — Fermat Competition", "#1 school-exam score in cohort", "#1 report-card score in cohort"],
  },
  {
    name: "Senior High",
    school: "SMA Negeri 1 Pontianak",
    period: "2022 — 2025",
    photo: "/images/journey/sma.jpg",
    logo: "/images/logos/sman1.png",
    tags: ["science", "competitive", "independent"],
    story:
      "Olympiads, committees and a group of friends who pushed each other all the way — many of us ended up at Universitas Indonesia together.",
    milestones: ["3rd — OSN Astronomy, provincial", "3rd — Physics Quiz Bowl, FMIPA Untan", "Ranked 11th academically in cohort"],
  },
  {
    name: "University",
    school: "Universitas Indonesia · Computer Science",
    period: "2025 — Present",
    photo: "/images/journey/ui.jpg",
    logo: "/images/logos/ui.png",
    tags: ["exploratory", "collaborative", "data-driven"],
    story:
      "The chapter where it gets serious: hackathons, data competitions, teaching and shipping products used by real people.",
    milestones: ["1st — JOINTS UGM Hackathon 2026", "Top 10 — LOGIKA UI 2026", "Top 10 — ASN Digital AI Hackathon 2025"],
  },
];

/* ------------------------------------------------------------------ */

export type SkillGroup = { title: string; blurb: string; items: string[] };

export const skillGroups: SkillGroup[] = [
  {
    title: "Agentic AI",
    blurb: "LLM agents that call tools, hold state and finish the job.",
    items: ["Multi-agent orchestration", "Tool use / function calling", "OpenClaw", "Claude API", "Groq", "Telegram & WhatsApp bots"],
  },
  {
    title: "Machine Learning",
    blurb: "From foundation-model embeddings to honest validation.",
    items: ["PyTorch", "scikit-learn", "LightGBM", "TabPFN", "DINOv2 / SigLIP", "Reinforcement learning (PPO)"],
  },
  {
    title: "Data & Optimisation",
    blurb: "Pipelines that are leak-free and decisions that are provable.",
    items: ["pandas", "Time series", "OR-Tools CP-SAT", "Gymnasium", "Feature engineering", "Kaggle"],
  },
  {
    title: "Product Engineering",
    blurb: "Shipping the interface around the model.",
    items: ["TypeScript", "Next.js / React", "FastAPI", "Django", "Supabase", "three.js / GSAP"],
  },
];

/** Flat list for marquees. */
export const techMarquee = [
  "Python", "PyTorch", "scikit-learn", "LightGBM", "TabPFN", "DINOv2", "SigLIP", "Stable-Baselines3",
  "OR-Tools", "FastAPI", "Django", "Next.js", "React", "TypeScript", "Tailwind CSS", "three.js",
  "GSAP", "Supabase", "PostgreSQL", "ESP32", "Claude API", "Groq", "Docker", "Vercel",
];

export const stats = [
  { value: 10, suffix: "+", label: "projects shipped" },
  { value: 10, suffix: "", label: "competition podiums & top ranks" },
  { value: 6, suffix: "", label: "national AI, data & hackathon placements" },
  { value: 99.57, suffix: "", decimals: 2, label: "best test F1 (vision)" },
];
