import { SITE_URL } from "@/lib/site";
import { getTracks, getSitemapEntries } from "@/lib/tracks";
import { getDsaUpdated } from "@/lib/dsa";

// Real time: data/ me jo tracks/modules hai wahi sitemap me aate hai.
// lastModified = JSON file ki actual modified date.
export default function sitemap() {
  const entries = getSitemapEntries();
  const latest = (list) =>
    new Date(Math.max(0, ...list.map((e) => new Date(e.updated).getTime())) || Date.now());

  // `slug` se build hone wale track URLs hi module wale track ke liye sahi
  // hain. Jin tracks ka apna route hai (dsa -> /dsa), unka track-page URL
  // exist nahi karta, isliye unhe yahan skip karte hain (neeche alag add kiya).
  const tracks = getTracks().filter((t) => !t.comingSoon && t.href === `/tracks/${t.slug}`);
  return [
    { url: SITE_URL, lastModified: latest(entries), changeFrequency: "weekly", priority: 1 },
    // DSA sheet ek dedicated page hai (track modules se nahi banti), isliye
    // alag se add karni padti hai.
    {
      url: `${SITE_URL}/dsa`,
      lastModified: new Date(getDsaUpdated()),
      changeFrequency: "weekly",
      priority: 0.9,
    },
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
