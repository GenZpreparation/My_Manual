import Link from "next/link";
import Navbar from "@/components/Navbar";
import FooterCta from "@/components/FooterCta";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import TrackView from "@/components/track/TrackView";
import { getTracks } from "@/lib/tracks";
import { SITE_URL } from "@/lib/site";

// /tracks/<slug> aur /tracks/<slug>/<module> dono isi se render hote hai.
// Questions server pe HTML me aate hai (crawlable) -- baaki modules client pe lazy.
export default function TrackPageContent({ track }) {
  const trackUrl = `${SITE_URL}/tracks/${track.slug}`;
  const crumbs = [
    { name: "Home", url: SITE_URL },
    { name: `${track.name} interview questions`, url: trackUrl },
  ];
  if (!track.isFirst) crumbs.push({ name: track.activeModule.label, url: `${trackUrl}/${track.activeId}` });

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.url })),
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${track.name} interview questions — ${track.activeModule?.label ?? ""}`.trim(),
      numberOfItems: track.activeQuestions.length,
      itemListElement: track.activeQuestions.slice(0, 50).map((q, i) => ({ "@type": "ListItem", position: i + 1, name: q.q })),
    },
  ];

  return (
    <>
      <JsonLd data={ld} />
      <Navbar tracks={getTracks()} />
      <main>
        <section className="track-hero">
          <div className="wrap">
            <Link href="/" className="track-breadcrumb">← All tracks</Link>
            <div className="track-hero-row">
              <div>
                <span className="track-hero-index">{track.index}</span>
                <h1>
                  {track.name}
                  <span className="seo-only"> Interview Questions</span>
                </h1>
                <p className="track-hero-tagline">{track.tagline}</p>
              </div>
            </div>
            <p className="track-hero-intro">{track.intro}</p>
          </div>
        </section>

        <TrackView
          key={`${track.slug}:${track.activeId}`}
          slug={track.slug}
          modules={track.modules}
          totalCount={track.totalCount}
          initialId={track.activeId}
          initialQuestions={track.activeQuestions}
        />
      </main>
      <FooterCta />
      <Footer />
    </>
  );
}
