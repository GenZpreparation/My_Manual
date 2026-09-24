import { notFound } from "next/navigation";
import TrackPageContent from "@/components/track/TrackPageContent";
import { getTrack, getAllModuleParams } from "@/lib/tracks";
import { SITE_NAME } from "@/lib/site";

// Har module ka apna crawlable URL: /tracks/python/module_3
export const dynamicParams = true;
export const generateStaticParams = () => getAllModuleParams().map((p) => ({ slug: p.slug, module: p.id }));

export function generateMetadata({ params }) {
  const t = getTrack(params.slug, params.module);
  if (!t) return { robots: { index: false } };
  const m = t.activeModule;
  const title = m.title || `${t.name} — ${m.label} interview questions`;
  const clean = (m.description || `${t.name} interview questions with model answers.`).replace(/\s+/g, " ").trim();
  const description = clean.length > 158 ? `${clean.slice(0, 155).trimEnd()}…` : clean;
  // Pehla module track root pe hai -- duplicate content se bachne ke liye canonical wahi
  const path = t.isFirst ? `/tracks/${t.slug}` : `/tracks/${t.slug}/${m.id}`;
  return {
    title,
    description,
    keywords: [`${t.name} interview questions`, ...m.topics.slice(0, 6).map((x) => `${x} interview questions`)],
    alternates: { canonical: path },
    openGraph: { type: "website", url: path, siteName: SITE_NAME, title, description },
  };
}

export default function ModulePage({ params }) {
  const track = getTrack(params.slug, params.module);
  if (!track || track.comingSoon) notFound();
  return <TrackPageContent track={track} />;
}
