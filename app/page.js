import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Tracks from "@/components/Tracks";
import Why from "@/components/Why";
import FooterCta from "@/components/FooterCta";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { getTracks } from "@/lib/tracks";
import { SITE_URL, SITE_NAME, DEFAULT_TITLE } from "@/lib/site";

// Description data/ folder se live banti hai (jitne languages live, utne naam + count)
export function generateMetadata() {
  const live = getTracks().filter((t) => !t.comingSoon);
  const total = live.reduce((s, t) => s + t.totalCount, 0);
  const names = live.map((t) => t.name).join(", ");
  const description = `Free interview questions with model answers${names ? ` for ${names}` : ""}${total ? ` — ${total} questions` : ""}, organised topic by topic. No sign up, no paywall.`;
  return {
    description,
    alternates: { canonical: "/" },
    openGraph: { type: "website", url: "/", siteName: SITE_NAME, title: DEFAULT_TITLE, description },
  };
}

// Tracks ki list, count aur "Coming soon" status data/ folders se REAL data se banta hai.
export default function Home() {
  const tracks = getTracks();
  const siteLd = [
    { "@context": "https://schema.org", "@type": "WebSite", name: SITE_NAME, url: SITE_URL, inLanguage: "en" },
    { "@context": "https://schema.org", "@type": "Organization", name: SITE_NAME, url: SITE_URL, logo: `${SITE_URL}/icon.svg` },
  ];
  return (
    <>
      <JsonLd data={siteLd} />
      <Navbar tracks={tracks} />
      <main>
        <Hero />
        <Tracks tracks={tracks} />
        <Why />
      </main>
      <FooterCta />
      <Footer />
    </>
  );
}
