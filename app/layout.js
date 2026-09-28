import "./globals.css";
import localFont from "next/font/local";
import ScrollReveal from "@/components/ScrollReveal";
import Motion3D from "@/components/Motion3D";
import { SITE_URL, SITE_NAME, DEFAULT_TITLE } from "@/lib/site";

// Wahi 3 fonts (Inter + Space Grotesk + Newsreader) — par ab `next/font/local`
// se, `next/font/google` se nahi.
//
// Kyun badla: `next/font/google` build time par fonts.gstatic.com se font
// download karta hai. Jab Vercel ka build machine us domain tak nahi pahunch
// paata, download fail hota hai aur build chup-chaap SUCCESS ho jaata hai —
// lekin site system-font fallback par chala jaati hai (serif headings aur
// Space Grotesk gayab). Ab fonts repo me hi hain, to build ko network ki
// zarurat hi nahi: har machine par same output, aur build thoda tez bhi.
//
// Files `fonts/` me hain, sirf `latin` subset (same as pehle `subsets:
// ["latin"]`). Ye sab variable fonts hain — ek hi file me poora weight range.
const inter = localFont({
  src: "../fonts/inter-latin-normal.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  variable: "--font-inter",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
});

const spaceGrotesk = localFont({
  src: "../fonts/space-grotesk-latin-normal.woff2",
  weight: "300 700",
  style: "normal",
  display: "swap",
  variable: "--font-space",
  fallback: ["system-ui", "-apple-system", "sans-serif"],
});

const newsreader = localFont({
  src: [
    { path: "../fonts/newsreader-latin-normal.woff2", weight: "200 800", style: "normal" },
    { path: "../fonts/newsreader-latin-italic.woff2", weight: "200 800", style: "italic" },
  ],
  display: "swap",
  variable: "--font-newsreader",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF7F0" },
    { media: "(prefers-color-scheme: dark)", color: "#16130E" },
  ],
};

// Global defaults -- har page apna title/description/canonical override karta hai.
// (canonical yahan NAHI rakha, warna sab pages home ko point karte.)
export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: DEFAULT_TITLE, template: `%s | ${SITE_NAME}` },
  description:
    "Free interview questions with plain-English model answers, organised topic by topic. No sign up, no paywall.",
  applicationName: SITE_NAME,
  keywords: ["interview questions", "interview preparation", "coding interview", "model answers", "free interview prep", "Python interview questions"],
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_IN", title: DEFAULT_TITLE },
  twitter: { card: "summary_large_image", title: DEFAULT_TITLE },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  formatDetection: { telephone: false },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
};

// Page paint hone se PEHLE hi chalta hai (blocking inline script) --
// isse localStorage me saved theme turant <html data-theme="..."> pe lag
// jaata hai, warna pehle hamesha light dikhkar dark me flash hota
// (jise "flash of wrong theme" kehte hai).
const themeInitScript = `
(function () {
  try {
    var saved = localStorage.getItem("interview-manual-theme");
    var theme = saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${newsreader.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        {children}
        <ScrollReveal />
        <Motion3D />
      </body>
    </html>
  );
}
