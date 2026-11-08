"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Check, Copy, MapPin, Send } from "lucide-react";
import { cn } from "@/lib/cn";
import { profile, socials, type SocialKey } from "@/data/site";
import SocialIcon from "@/components/shared/SocialIcons";
import Reveal from "@/components/shared/Reveal";
import { Highlight } from "@/components/shared/SectionHeading";
import {
  DotGrid,
  GhostTiles,
  MosaicRight,
  QuarterCircle,
  TileCluster,
} from "@/components/shared/Decorators";
import "@/components/layout/layout.css";

/* ---------- social card palette (hackvidia four-colour rhythm) ---------- */
const tile: Partial<Record<SocialKey, { bg: string; fg: string; deco: "primary" | "sky" | "coral" | "saffron" }>> = {
  github: { bg: "bg-navy-900", fg: "text-white", deco: "primary" },
  linkedin: { bg: "bg-primary", fg: "text-white", deco: "sky" },
  instagram: { bg: "bg-accent-coral", fg: "text-white", deco: "coral" },
  resume: { bg: "bg-accent-saffron", fg: "text-navy-950", deco: "saffron" },
};
const fallbackTile = { bg: "bg-accent-sky", fg: "text-white", deco: "sky" as const };

/* ---------- form ---------- */
type Fields = { name: string; email: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = "Tell me your name (at least 2 characters).";
  if (!EMAIL_RE.test(f.email.trim())) e.email = "That email doesn't look right.";
  if (f.message.trim().length < 10) e.message = "A little more detail, please (10+ characters).";
  return e;
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export default function Contact() {
  const [toast, setToast] = useState<{ msg: string; ok: boolean; visible: boolean }>({
    msg: "",
    ok: true,
    visible: false,
  });
  const [copied, setCopied] = useState(false);
  const [fields, setFields] = useState<Fields>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const toastTimer = useRef<number | undefined>(undefined);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const uid = useId();
  const ids = {
    name: `${uid}-name`,
    email: `${uid}-email`,
    message: `${uid}-message`,
  };

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok, visible: true });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
      setCopied(false);
    }, 2200);
  };

  const onCopy = async () => {
    const ok = await copyText(profile.email);
    setCopied(ok);
    showToast(ok ? "Email copied to clipboard" : `Couldn't copy — it's ${profile.email}`, ok);
  };

  const update = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFields((f) => ({ ...f, [key]: value }));
    setSent(false);
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        if (!validate({ ...fields, [key]: value })[key]) delete next[key];
        return next;
      });
    }
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validate(fields);
    setErrors(errs);
    const firstBad = (["name", "email", "message"] as const).find((k) => errs[k]);
    if (firstBad) {
      const target = { name: nameRef, email: emailRef, message: messageRef }[firstBad];
      target.current?.focus();
      return;
    }
    const subject = `Hello from ${fields.name.trim()}`;
    const body = `${fields.message.trim()}\n\n— ${fields.name.trim()} (${fields.email.trim()})`;
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  const fieldCls = (bad?: string) =>
    cn(
      "peer w-full rounded-2xl border bg-surface-alt px-4 text-[15px] text-ink placeholder:text-ink-faint outline-none transition-[border-color,background-color,box-shadow] duration-300",
      "focus:bg-white focus:shadow-[0_0_0_4px_rgba(79,139,255,0.15)]",
      bad ? "border-state-error/70 focus:border-state-error" : "border-transparent hover:border-primary-soft focus:border-accent-sky",
    );

  const socialCards = socials.filter((s) => s.key !== "email");

  return (
    <section
      id="contact"
      data-nav-theme="light"
      aria-labelledby="contact-title"
      className="relative overflow-hidden bg-surface-alt py-24 sm:py-28 lg:py-36"
    >
      {/* ---------- decor ---------- */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <MosaicRight className="absolute -right-10 -top-4 h-auto w-[200px] opacity-90 sm:w-[260px] lg:right-0 lg:top-0 lg:w-[337px]" />
        <TileCluster className="absolute -bottom-6 -left-20 h-auto w-[300px] lg:w-[465px]" opacity={0.14} />
        <div className="absolute left-[8%] top-[18%] hidden h-48 w-72 [mask-image:radial-gradient(ellipse,black,transparent_70%)] lg:block">
          <DotGrid opacity={0.25} gap={16} radius={1.6} />
        </div>
        <div className="absolute right-[12%] top-[40%] h-[420px] w-[420px] rounded-full bg-accent-sky/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        {/* ---------- header ---------- */}
        <Reveal>
          <p className="flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.16em] text-primary">
            <span aria-hidden className="h-px w-8 bg-current opacity-60" />
            Contact
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2
            id="contact-title"
            className="mt-6 max-w-[15ch] text-[clamp(2.6rem,9.2vw,7.25rem)] font-extrabold leading-[0.98] tracking-[-0.04em] text-ink"
          >
            Let&apos;s build something that{" "}
            <Highlight>
              <span className="bg-linear-to-r from-primary via-accent-sky to-primary-vivid bg-clip-text pr-[0.04em] text-transparent">
                thinks
              </span>
            </Highlight>
            <span className="text-accent-saffron">.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6">
            <p className="inline-flex items-start gap-2 text-[15px] text-ink-muted">
              <MapPin className="mt-[3px] h-4 w-4 shrink-0 text-accent-coral" aria-hidden />
              {profile.location}
            </p>
          </div>
        </Reveal>

        {/* ---------- body ---------- */}
        <div className="mt-14 grid gap-6 lg:mt-20 lg:grid-cols-12 lg:gap-8">
          {/* left: email + socials */}
          <div className="flex flex-col gap-6 lg:col-span-7">
            <Reveal>
              <div className="group/mail relative overflow-hidden rounded-[32px] bg-navy-900 p-6 text-white shadow-[0_30px_60px_-28px_rgba(11,16,45,0.7)] sm:p-10">
                <div aria-hidden className="pointer-events-none absolute inset-0">
                  <GhostTiles className="absolute -right-28 -top-10 h-auto w-[420px] sm:w-[520px]" opacity={0.07} />
                  <QuarterCircle
                    size={140}
                    color="sky"
                    rotate={180}
                    className="absolute -bottom-px -left-px opacity-25 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/mail:scale-110"
                  />
                  <div className="absolute -right-20 -bottom-24 h-72 w-72 rounded-full bg-accent-sky/25 blur-[90px]" />
                </div>

                <div className="relative">
                  <p className="text-[13px] font-medium text-white/55">Email is the best way to reach me</p>
                  <a
                    href={`mailto:${profile.email}`}
                    className="mt-4 block break-all text-[clamp(1.45rem,6.4vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-white transition-colors hover:text-accent-saffron"
                    data-cursor-label="Write"
                  >
                    {profile.email}
                  </a>
                  <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/60">
                    For research collaborations, projects or an AI idea you want to see running. I read
                    everything and reply personally.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={onCopy}
                      className={cn(
                        "inline-flex h-12 items-center gap-2.5 rounded-full px-5 text-[14px] font-bold transition-[background-color,color,transform] duration-300 active:scale-[0.97]",
                        copied ? "bg-state-success text-white" : "bg-white text-navy-900 hover:bg-accent-saffron",
                      )}
                    >
                      {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
                      {copied ? "Copied" : "Copy address"}
                    </button>
                    <a
                      href={`mailto:${profile.email}`}
                      className="group/btn inline-flex h-12 items-center gap-2 rounded-full border border-white/15 bg-white/5 pl-5 pr-2 text-[14px] font-bold text-white backdrop-blur-xl transition-colors hover:border-white/30 hover:bg-white/10"
                    >
                      Open mail app
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-accent-sky text-white transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:rotate-45">
                        <ArrowUpRight className="h-4 w-4" aria-hidden />
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>

            <ul className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
              {socialCards.map((s, i) => {
                const c = tile[s.key] ?? fallbackTile;
                return (
                  <li key={s.key}>
                    <Reveal delay={0.05 * i} className="h-full">
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${s.label} — ${s.handle} (opens in a new tab)`}
                        className="group/card relative flex h-full items-center gap-4 overflow-hidden rounded-[24px] border border-navy-900/[0.06] bg-white p-4 shadow-[0_14px_34px_-24px_rgba(11,16,45,0.45)] transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-primary/15 hover:shadow-[0_24px_50px_-24px_rgba(11,16,45,0.45)] sm:p-5"
                      >
                        <QuarterCircle
                          size={72}
                          color={c.deco}
                          rotate={90}
                          className="absolute -right-px -top-px opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:opacity-20 scale-50 group-hover/card:scale-100 origin-top-right"
                        />
                        <span
                          className={cn(
                            "relative grid h-12 w-12 shrink-0 place-items-center rounded-[16px] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:-rotate-6",
                            c.bg,
                            c.fg,
                          )}
                        >
                          <SocialIcon name={s.key} className="h-[22px] w-[22px]" />
                        </span>
                        <span className="relative flex min-w-0 flex-col">
                          <span className="text-[16px] font-bold text-ink">{s.label}</span>
                          <span className="truncate text-[13px] text-ink-muted">{s.handle}</span>
                        </span>
                        <ArrowUpRight
                          aria-hidden
                          className="relative ml-auto h-5 w-5 shrink-0 text-ink-faint transition-[transform,color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:rotate-45 group-hover/card:text-primary"
                        />
                      </a>
                    </Reveal>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* right: compose form */}
          <Reveal delay={0.1} className="lg:col-span-5">
            <div className="relative h-full overflow-hidden rounded-[32px] border border-navy-900/[0.06] bg-white shadow-[0_20px_50px_-20px_rgba(11,16,45,0.35)]">
              {/* hackvidia accent strip */}
              <div aria-hidden className="flex h-1.5">
                <span className="flex-1 bg-primary" />
                <span className="flex-1 bg-accent-sky" />
                <span className="flex-1 bg-accent-coral" />
                <span className="flex-1 bg-accent-saffron" />
              </div>

              <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5 p-5 sm:p-7" aria-describedby={`${uid}-note`}>
                <div>
                  <h3 className="text-[22px] font-extrabold tracking-tight text-ink">Send a message</h3>
                  <p id={`${uid}-note`} className="mt-1.5 text-[14px] leading-relaxed text-ink-muted">
                    No backend, no tracking — this drafts an email in your own mail app, ready to send.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor={ids.name} className="text-[13px] font-semibold text-ink">
                    Your name
                  </label>
                  <input
                    ref={nameRef}
                    id={ids.name}
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Ada Lovelace"
                    value={fields.name}
                    onChange={update("name")}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? `${ids.name}-err` : undefined}
                    className={cn(fieldCls(errors.name), "h-12")}
                  />
                  {errors.name && (
                    <p id={`${ids.name}-err`} className="text-[13px] font-medium text-state-error">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor={ids.email} className="text-[13px] font-semibold text-ink">
                    Your email
                  </label>
                  <input
                    ref={emailRef}
                    id={ids.email}
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={fields.email}
                    onChange={update("email")}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? `${ids.email}-err` : undefined}
                    className={cn(fieldCls(errors.email), "h-12")}
                  />
                  {errors.email && (
                    <p id={`${ids.email}-err`} className="text-[13px] font-medium text-state-error">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor={ids.message} className="text-[13px] font-semibold text-ink">
                    What are we building?
                  </label>
                  <textarea
                    ref={messageRef}
                    id={ids.message}
                    name="message"
                    rows={5}
                    placeholder="An agent that…"
                    value={fields.message}
                    onChange={update("message")}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? `${ids.message}-err` : undefined}
                    data-lenis-prevent
                    className={cn(fieldCls(errors.message), "min-h-[140px] resize-y py-3.5 leading-relaxed")}
                  />
                  {errors.message && (
                    <p id={`${ids.message}-err`} className="text-[13px] font-medium text-state-error">
                      {errors.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="group/send mt-1 inline-flex h-14 items-center justify-center gap-3 rounded-full bg-navy-900 px-6 text-[15px] font-bold text-white transition-[background-color,transform] duration-300 hover:bg-primary active:scale-[0.98]"
                >
                  Draft the email
                  <Send
                    className="h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/send:-translate-y-0.5 group-hover/send:translate-x-1"
                    aria-hidden
                  />
                </button>

                <p aria-live="polite" className="min-h-[1.25rem] text-[13px] text-ink-muted">
                  {sent ? (
                    <>
                      <span className="text-state-success">✓</span> Your mail app should open now. If it
                      doesn&apos;t, write to {profile.email}.
                    </>
                  ) : null}
                </p>
              </form>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ---------- toast ---------- */}
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "pointer-events-none fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
          toast.visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        )}
      >
        {toast.msg && (
          <span className="flex items-center gap-2.5 whitespace-nowrap rounded-full bg-navy-900 px-5 py-3 text-[13px] font-medium text-white shadow-[0_20px_40px_-12px_rgba(5,8,26,0.6)] ring-1 ring-white/10">
            <span
              className={cn(
                "grid h-5 w-5 place-items-center rounded-full",
                toast.ok ? "bg-state-success" : "bg-accent-saffron text-navy-950",
              )}
              aria-hidden
            >
              {toast.ok ? <Check className="h-3 w-3" /> : "!"}
            </span>
            {toast.msg}
          </span>
        )}
      </div>
    </section>
  );
}
