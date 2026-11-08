/**
 * Identity, navigation and contact for the portfolio.
 * Sources: PBP "myPortofolio" assignment (term3/PBP/portofolio), CV, project READMEs.
 */

export type SocialKey = "github" | "linkedin" | "instagram" | "email" | "resume" | "x" | "line" | "spotify" | "medium" | "kaggle";

export type SocialLink = { key: SocialKey; label: string; href: string; handle: string };

export const profile = {
  name: "Nugraha Kautsarrizqi Caksana",
  short: "Nugraha",
  firstName: "Nugraha",
  initials: "N",
  /** Rotating words for the hero typewriter. */
  roles: ["AI Agents", "Machine Learning", "Computer Vision", "Data Science", "Full-Stack Web", "3D Web"],
  headline: "I build AI that acts — agents, models and the products around them.",
  location: "Depok, Indonesia · from Pontianak, the Equator City",
  campus: "Computer Science · Universitas Indonesia",
  status: "Open to internships, research & collaborations",
  photo: "/images/nugraha.jpg",
  bio: [
    "I'm a Computer Science undergraduate at Universitas Indonesia who loves the moment a model stops being a notebook and starts doing real work. Most of what I ship sits where AI meets product: multi-agent systems that execute instead of just advising, vision models tuned to the last decimal, and tabular pipelines that rank risk for real lenders.",
    "Before code, there was the night sky — I placed third in the provincial National Science Olympiad (OSN) in Astronomy. The same habit of reading patterns out of noise now drives how I build models, interfaces and 3D experiences on the web.",
  ],
  email: "nugrahakc@gmail.com",
  resume: "https://drive.google.com/file/d/136sJkpda_LMqWngHVFw7ASPczF36OqH-/view?usp=sharing",
} as const;

export const socials: SocialLink[] = [
  { key: "github", label: "GitHub", href: "https://github.com/LVNAx", handle: "@LVNAx" },
  { key: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/nugrahakc", handle: "in/nugrahakc" },
  { key: "kaggle", label: "Kaggle", href: "https://www.kaggle.com/nugrahakc", handle: "@nugrahakc" },
  { key: "instagram", label: "Instagram", href: "https://instagram.com/nugrahakc", handle: "@nugrahakc" },
  { key: "email", label: "Email", href: "mailto:nugrahakc@gmail.com", handle: "nugrahakc@gmail.com" },
  { key: "resume", label: "Resume", href: "https://drive.google.com/file/d/136sJkpda_LMqWngHVFw7ASPczF36OqH-/view?usp=sharing", handle: "CV (PDF)" },
];

/** Single-page anchors. Section components must use these ids. */
export const navLinks = [
  { label: "About", href: "#about" },
  { label: "AI Lab", href: "#ai-lab" },
  { label: "Projects", href: "#projects" },
  { label: "Cosmos", href: "#cosmos" },
  { label: "Journey", href: "#journey" },
  { label: "Contact", href: "#contact" },
] as const;

export const SECTION_IDS = {
  hero: "top",
  about: "about",
  aiLab: "ai-lab",
  projects: "projects",
  cosmos: "cosmos",
  journey: "journey",
  contact: "contact",
} as const;
