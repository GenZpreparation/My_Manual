import { notFound } from "next/navigation";
import TrackPageContent from "@/components/track/TrackPageContent";
import { getTracks, getTrack } from "@/lib/tracks";
import { SITE_NAME } from "@/lib/site";

export const dynamicParams = true; // naya data/<slug> folder turant chalta hai; unknown slug notFound() deta hai
export const generateStaticParams = () =>
  getTracks().filter((t) => !t.comingSoon).map((t) => ({ slug: t.slug }));

export function generateMetadata({ params }) {
  const t = getTrack(params.slug);
  if (!t || t.comingSoon) return { robots: { index: false } };
  const title = `${t.name} Interview Questions and Answers`;
  const description = `${t.totalCount} ${t.name} interview questions with clear model answers across ${t.modules.length} module${t.modules.length === 1 ? "" : "s"} — free, no sign up.`;
  return {
    title,
    description,
    keywords: [`${t.name} interview questions`, `${t.name} interview questions and answers`, `${t.name} interview preparation`],
    alternates: { canonical: `/tracks/${t.slug}` },
    openGraph: { type: "website", url: `/tracks/${t.slug}`, siteName: SITE_NAME, title, description },
  };
}

export default function TrackPage({ params }) {
  const track = getTrack(params.slug);
  if (!track || track.comingSoon) notFound();
  return <TrackPageContent track={track} />;
}
