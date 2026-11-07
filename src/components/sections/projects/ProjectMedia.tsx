import clsx from "clsx";
import { asset } from "@/lib/asset";
import type { Project } from "@/data/portfolio";
import { TileField } from "./Geometry";
import { categoryTag, isPoster, objectPositionFor, rgb } from "./utils";

/**
 * Generated cover for projects without a screenshot: navy -> accent
 * gradient, a deterministic tile composition and the title set big in
 * the display face.
 */
export function GeneratedCover({
  project,
  size = "card",
  hideTitle = false,
  className,
}: {
  project: Project;
  size?: "card" | "hero";
  /** Drop the big title (when the title is already printed next to the media). */
  hideTitle?: boolean;
  className?: string;
}) {
  const a = rgb(project.accent);
  return (
    <div
      role="img"
      aria-label={`${project.title} — generated cover`}
      className={clsx("absolute inset-0 overflow-hidden bg-navy-900", className)}
      style={{
        backgroundImage: `radial-gradient(120% 90% at 100% 0%, rgba(${a},0.55) 0%, rgba(${a},0.12) 38%, transparent 62%), linear-gradient(160deg, #141d48 0%, #0b102d 55%, #05081a 100%)`,
      }}
    >
      {/* tile composition, anchored top-right and fading toward the title */}
      <TileField
        seed={project.slug}
        accent={project.accent}
        cols={6}
        rows={4}
        density={0.72}
        className="absolute -top-[6%] right-[-8%] h-[92%] w-[78%] [mask-image:linear-gradient(225deg,#000_35%,transparent_85%)]"
      />
      {/* fine grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
          backgroundSize: size === "hero" ? "48px 48px" : "32px 32px",
        }}
      />
      {!hideTitle && (
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-5 sm:p-6" aria-hidden>
        <span className="font-mono text-[10px] tracking-[0.18em] text-white/55 uppercase sm:text-[11px]">
          {`> ${categoryTag[project.category]} · ${project.year}`}
        </span>
        <span
          className={clsx(
            "font-sans leading-[0.95] font-extrabold tracking-tight text-white",
            size === "hero" ? "max-w-[62%] text-[40px] sm:text-[60px]" : "max-w-[58%] text-[28px] sm:text-[34px]",
          )}
        >
          {project.title}
        </span>
      </div>
      )}
      <span
        aria-hidden
        className="absolute bottom-5 right-5 h-3 w-3 rounded-full sm:bottom-6 sm:right-6"
        style={{ background: project.accent, boxShadow: `0 0 18px rgba(${a},0.9)` }}
      />
    </div>
  );
}

/** Screenshot (via asset()) when present, otherwise the generated cover. Fills its positioned parent. */
export function ProjectMedia({
  project,
  size = "card",
  className,
  imgClassName,
  priority = false,
  hideTitle = false,
}: {
  project: Project;
  size?: "card" | "hero";
  hideTitle?: boolean;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
}) {
  if (!project.image)
    return <GeneratedCover project={project} size={size} hideTitle={hideTitle} className={className} />;
  if (isPoster(project.slug)) {
    return (
      <div className={clsx("absolute inset-0 overflow-hidden", className)}>
        <GeneratedCover project={project} size={size} hideTitle={hideTitle} />
        <div className="absolute top-1/2 right-[10%] aspect-[1447/2047] h-[62%] -translate-y-1/2 rotate-[5deg]">
          {/* eslint-disable-next-line @next/next/no-img-element -- static export, unoptimised images */}
          <img
            src={asset(project.image)}
            alt={`${project.title} — ${project.tagline}`}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            draggable={false}
            className={clsx(
              "h-full w-full rounded-[10px] object-cover shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/20",
              imgClassName,
            )}
          />
        </div>
      </div>
    );
  }
  return (
    <div className={clsx("absolute inset-0 overflow-hidden bg-surface", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static export, unoptimised images */}
      <img
        src={asset(project.image)}
        alt={`${project.title} — ${project.tagline}`}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        className={clsx("h-full w-full object-cover", imgClassName)}
        style={{ objectPosition: objectPositionFor(project.slug) }}
      />
    </div>
  );
}
