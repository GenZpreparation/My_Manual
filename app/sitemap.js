import { SITE_URL } from "@/lib/site";
import { getTracks, getSitemapEntries } from "@/lib/tracks";

// Real time: data/ me jo tracks/modules hai wahi sitemap me aate hai.
// lastModified = JSON file ki actual modified date.
export default function sitemap() {
  const entries = getSitemapEntries();
  const latest = (list) =>
    new Date(Math.max(0, ...list.map((e) => new Date(e.updated).getTime())) || Date.now());

  const tracks = getTracks().filter((t) => !t.comingSoon);
  return [
    { url: SITE_URL, lastModified: latest(entries), changeFrequency: "weekly", priority: 1 },
    ...tracks.map((t) => ({
      url: `${SITE_URL}/tracks/${t.slug}`,
      lastModified: latest(entries.filter((e) => e.slug === t.slug)),
      changeFrequency: "weekly",
      priority: 0.9,
    })),
    // pehla module track ke root URL pe hi hai (duplicate se bachne ke liye skip)
    ...entries
      .filter((e) => !e.first)
      .map((e) => ({
        url: `${SITE_URL}/tracks/${e.slug}/${e.id}`,
        lastModified: new Date(e.updated),
        changeFrequency: "monthly",
        priority: 0.7,
      })),
  ];
}
