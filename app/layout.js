import "./globals.css";
import { Inter, Space_Grotesk, Newsreader } from "next/font/google";
import ScrollReveal from "@/components/ScrollReveal";
import Motion3D from "@/components/Motion3D";
import { SITE_URL, SITE_NAME, DEFAULT_TITLE } from "@/lib/site";

// Wahi 3 fonts, bas ab build time pe self-host hote hai (extra network hop nahi, render-blocking CSS nahi).
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], display: "swap", variable: "--font-space" });
const newsreader = Newsreader({ subsets: ["latin"], style: ["normal", "italic"], axes: ["opsz"], display: "swap", variable: "--font-newsreader" });

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
