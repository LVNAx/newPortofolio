import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/layout/SmoothScroll";
import Cursor from "@/components/layout/Cursor";
import { profile } from "@/data/site";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono-jb",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const description = `${profile.short} — ${profile.headline} ${profile.campus}.`;

export const metadata: Metadata = {
  title: { default: profile.short, template: `%s · ${profile.short}` },
  description,
  openGraph: { type: "website", title: profile.short, description },
  twitter: { card: "summary_large_image", title: profile.short, description },
};

export const viewport: Viewport = {
  themeColor: "#0b102d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${mono.variable}`}>
      <body className="bg-navy-900 font-sans text-ink antialiased">
        <SmoothScroll />
        <Cursor />
        <Navbar />
        <main className="relative">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
