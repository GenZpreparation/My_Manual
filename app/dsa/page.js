import Link from "next/link";
import Navbar from "@/components/Navbar";
import FooterCta from "@/components/FooterCta";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import DsaExplorer from "@/components/dsa/DsaExplorer";
import { getTracks } from "@/lib/tracks";
import { getDsaSheet, getDsaProgressIndex, queryDsaProblems } from "@/lib/dsa";
import { SITE_URL, SITE_NAME } from "@/lib/site";

const PATH = "/dsa";

// Ek page me kitne problems. Client bhi yahi default use karta hai
// (components/dsa/DsaExplorer.js ka PER_PAGE) -- dono alag hue to pehla page
// dobara fetch ho jayega.
const PER_PAGE = 40;

export function generateMetadata() {
  const { stats, meta } = getDsaSheet();
  const title = `DSA Questions — ${stats.total} Data Structures & Algorithms Problems`;
  const description =
    `${stats.total} curated DSA problems from the DSA Master Sheet (${stats.part.A}) and LearnYard (${stats.part.B}) ` +
    `across ${stats.topics} topics — ${stats.difficulty.easy} easy, ${stats.difficulty.medium} medium, ${stats.difficulty.hard} hard. ` +
    "Search, filter and track your solved progress. Free, no sign up.";
  return {
    title,
    description,
    keywords: [
      "DSA questions",
      "DSA practice problems",
      "data structures and algorithms questions",
      "LeetCode problems",
      "DSA roadmap",
      "easy medium hard DSA problems",
      "arrays questions",
      "graph questions",
      "dynamic programming questions",
    ],
    alternates: { canonical: PATH },
    openGraph: { type: "website", url: PATH, siteName: SITE_NAME, title, description },
  };
}

export default function DsaPage() {
  const { stats, topics, problems, meta } = getDsaSheet();
  const url = `${SITE_URL}${PATH}`;

  // Sirf PEHLA page server-render hota hai (SEO + fast first paint). Baaki 17
  // pages `/api/dsa/problems` se lazy aate hain jab user pagination use karta
  // hai -- isliye HTML ~580 KB se girkar ~90 KB ho jaata hai.
  const firstPage = queryDsaProblems({ perPage: PER_PAGE });

  // Progress summary ke liye chhota index (id + topic + difficulty). Poori
  // problems list bhejne ki zarurat nahi -- wo pagination se aati hai.
  const progressIndex = getDsaProgressIndex();

  // `filterKey` wahi string hai jo client apne cache key me use karta hai --
  // isse server-rendered page cache me baith kar dobara fetch nahi hota.
  const initial = {
    ...firstPage,
    filterKey: JSON.stringify({
      topic: "all",
      q: "",
      diff: "all",
      part: "all",
      sort: "sheet",
    }),
  };

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "DSA Questions", item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "DSA Questions",
      url,
      description: meta.description,
      inLanguage: "en",
      isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
      mainEntity: {
        "@type": "ItemList",
        name: "DSA practice problems",
        numberOfItems: problems.length,
        itemListElement: problems.slice(0, 200).map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: p.title,
          url: p.leetcode || `${url}?p=${p.id}`,
        })),
      },
    },
  ];

  return (
    <>
      <JsonLd data={ld} />
      <Navbar tracks={getTracks()} />

      <main>
        {/* ---------------- Hero ---------------- */}
        <section className="dsa-hero">
          <div className="wrap">
            <Link href="/#tracks" className="track-breadcrumb">
              ← All tracks
            </Link>

            <div className="dsa-hero-top">
              <div>
                <span className="dsa-hero-eyebrow">Practice sheet</span>
                <h1>
                  DSA <span className="seo-only">Questions</span> Questions
                </h1>
                <p className="dsa-hero-tagline">
                  {stats.total} hand-picked problems, easy to hard — with a direct practice link for every single one.
                </p>
              </div>

              <div className="dsa-hero-cta">
                <a className="btn-primary" href="#dsa-list-start">
                  Start with Arrays
                </a>
                <span className="dsa-hero-cta-sub">No sign up · progress stays in your browser</span>
              </div>
            </div>

            {/* Stat strip: total + difficulty + source split */}
            <div className="dsa-stats">
              <div className="dsa-stat">
                <span className="dsa-stat-num">{stats.total}</span>
                <span className="dsa-stat-label">problems</span>
              </div>
              <div className="dsa-stat is-easy">
                <span className="dsa-stat-num">{stats.difficulty.easy}</span>
                <span className="dsa-stat-label">easy</span>
              </div>
              <div className="dsa-stat is-medium">
                <span className="dsa-stat-num">{stats.difficulty.medium}</span>
                <span className="dsa-stat-label">medium</span>
              </div>
              <div className="dsa-stat is-hard">
                <span className="dsa-stat-num">{stats.difficulty.hard}</span>
                <span className="dsa-stat-label">hard</span>
              </div>
              <div className="dsa-stat">
                <span className="dsa-stat-num">{stats.topics}</span>
                <span className="dsa-stat-label">topics</span>
              </div>
              <div className="dsa-stat">
                <span className="dsa-stat-num">{stats.withLeetCode}</span>
                <span className="dsa-stat-label">LeetCode links</span>
              </div>
            </div>

            <p className="dsa-hero-intro">
              Two curated lists in one place: the <strong>DSA Master Sheet</strong> ({stats.part.A} problems, roadmap order,
              rated by stars) and <strong>LearnYard</strong> ({stats.part.B} extra problems grouped by subtopic). Tick a
              problem off as you solve it — your progress is saved in this browser, no account needed.
            </p>
          </div>
        </section>

        <div id="dsa-list-start">
          <DsaExplorer
            initial={initial}
            progressIndex={progressIndex}
            topics={topics}
            stats={stats}
          />
        </div>
      </main>

      <FooterCta />
      <Footer />
    </>
  );
}