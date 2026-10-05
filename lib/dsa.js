import fs from "fs";
import path from "path";

// DSA sheet ka data: data/dsa/problems.json (718 problems, Part A = DSA Master
// Sheet, Part B = LearnYard). Ye track loader (lib/tracks.js) se alag hai --
// yahan question + model answer nahi, problem + practice links hote hai,
// isliye apna loader aur apna page (/dsa) rakha gaya hai.
//
// NOTE: ye file server-only hai (fs use karti hai). Client components ko data
// props ke through milta hai -- unke andar `import ... from "@/lib/dsa"`
// kabhi mat karna, warna Next bundler fail ho jayega.

const dataFile = path.join(process.cwd(), "data", "dsa", "problems.json");
const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf-8"));

// Status cycle order. JSON ke `filters.status` me bhi yahi list hai.
export const DSA_STATUSES = ["pending", "in_progress", "solved", "doubt", "review", "skipped"];

export const DSA_DIFFICULTIES = ["easy", "medium", "hard"];

// localStorage me progress isi key ke niche save hota hai (browser me hi --
// koi account/backend nahi, site ka "no sign up" promise yahi hai).
export const DSA_PROGRESS_KEY = "interview-manual-dsa-progress-v1";

const DIFF_RANK = { easy: 0, medium: 1, hard: 2 };

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// JSON me jo GFG link diya gaya hai wo Google ka "I'm Feeling Lucky" redirect
// hai (`btnI=1`). Wo unreliable hai (kabhi seedha problem par, kabhi Google
// consent screen par le jaata hai), isliye hum wahi search URL `btnI=1` hatakar
// banate hain -- user ko hamesha proper GFG results page milta hai.
const gfgSearchUrl = (title) =>
  "https://www.google.com/search?q=" +
  encodeURIComponent(`site:geeksforgeeks.org/problems ${title}`);

// LeetCode link na ho to ek generic search fallback -- koi problem row "empty"
// nahi dikhna chahiye, warna sheet par kuch missing lagta hai.
const webSearchUrl = (title) =>
  "https://www.google.com/search?q=" + encodeURIComponent(`${title} leetcode`);

let cache;

function build() {
  const raw = readJson(dataFile);
  const list = Array.isArray(raw.problems) ? raw.problems : [];

  // Problems JSON ke original order me -- wo hi roadmap ka recommended order
  // hai. `n` = 1-based serial, list me position dikhane ke liye.
  const problems = list.map((p, i) => ({
    id: p.id,
    n: i + 1,
    title: p.title,
    topic: p.topic,
    subtopic: p.subtopic || null,
    part: p.part,
    source: p.source,
    difficulty: p.difficulty,
    stars: p.stars == null ? null : p.stars,
    serial: p.master_serial == null ? null : p.master_serial,
    leetcode: p.links?.leetcode || null,
    gfg: gfgSearchUrl(p.title),
    search: webSearchUrl(p.title),
  }));

  // Topic order: pehle Part A ka roadmap order (JSON ka
  // `filters.topic_order_part_a`), phir bache hue topics -- jaise Part B ke
  // naye topics (Heap, Hashmap / Design) jo pehle list me nahi aate.
  const preferred = Array.isArray(raw.filters?.topic_order_part_a)
    ? raw.filters.topic_order_part_a
    : [];
  const seen = [];
  for (const p of problems) if (!seen.includes(p.topic)) seen.push(p.topic);
  const topicOrder = [
    ...preferred.filter((t) => seen.includes(t)),
    ...seen.filter((t) => !preferred.includes(t)),
  ];

  const topics = topicOrder.map((name) => {
    const items = problems.filter((p) => p.topic === name);
    const byDiff = { easy: 0, medium: 0, hard: 0 };
    const byPart = { A: 0, B: 0 };
    for (const p of items) {
      if (byDiff[p.difficulty] != null) byDiff[p.difficulty] += 1;
      if (byPart[p.part] != null) byPart[p.part] += 1;
    }
    return {
      name,
      slug: slugify(name),
      total: items.length,
      easy: byDiff.easy,
      medium: byDiff.medium,
      hard: byDiff.hard,
      partA: byPart.A,
      partB: byPart.B,
      subtopics: [...new Set(items.map((p) => p.subtopic).filter(Boolean))],
    };
  });

  const difficulty = { easy: 0, medium: 0, hard: 0 };
  const part = { A: 0, B: 0 };
  for (const p of problems) {
    if (difficulty[p.difficulty] != null) difficulty[p.difficulty] += 1;
    if (part[p.part] != null) part[p.part] += 1;
  }

  const stats = {
    total: problems.length,
    topics: topics.length,
    difficulty,
    part,
    withLeetCode: problems.filter((p) => p.leetcode).length,
    subtopics: [...new Set(problems.map((p) => p.subtopic).filter(Boolean))].length,
  };

  return {
    meta: {
      title: raw.title || "DSA Roadmap - Easy to Medium to Hard",
      description: raw.description || "",
      sourceFile: raw.source_file || "",
      rule: raw.source_notes?.part_a_difficulty_rule || "",
    },
    stats,
    topics,
    problems,
    updated: fs.statSync(dataFile).mtime.toISOString(),
  };
}

export function getDsaSheet() {
  if (cache && process.env.NODE_ENV === "production") return cache;
  cache = build();
  return cache;
}

export const getDsaStats = () => getDsaSheet().stats;
export const getDsaTopics = () => getDsaSheet().topics;
export const getDsaProblems = () => getDsaSheet().problems;
export const getDsaUpdated = () => getDsaSheet().updated;

export const getDsaTopicBySlug = (slug) =>
  getDsaSheet().topics.find((t) => t.slug === slug) || null;

export const getDsaProblemById = (id) =>
  getDsaSheet().problems.find((p) => p.id === id) || null;

// Sirf progress summary (sidebar ka "x/y solved", status filter ke counts)
// ke liye chhota index. Poore dataset ko client ko bhejne ki zarurat nahi --
// id + topic + difficulty bas ~15 KB, jabki full problems list ~220 KB hai.
// List khud API se page-by-page aati hai (lazy loading).
export function getDsaProgressIndex() {
  return getDsaSheet().problems.map((p) => ({
    id: p.id,
    topic: p.topic,
    difficulty: p.difficulty,
  }));
}

// Poora filter + sort + paginate logic EK jagah hai, aur yehi dono jagah se
// chalta hai: page ka first render (server) aur /api/dsa/problems (lazy pages).
// Isliye pehla page HTML aur baad ke pages kabhi mismatch nahi karte.
//
// `focus` = seedha us problem wali page kholne ke liye (navbar search ka
// jump -> /dsa?p=a_0500). List me wo problem na mile to page 1 par rehte hai.
export function queryDsaProblems({
  topic,
  q,
  diff,
  part,
  sort,
  page = 1,
  perPage = 40,
  all = false,
  focus = null,
} = {}) {
  let list = getDsaSheet().problems;

  const t = topic && topic !== "all" ? getDsaTopicBySlug(topic) : null;
  if (t) list = list.filter((p) => p.topic === t.name);
  if (diff && diff !== "all") list = list.filter((p) => p.difficulty === diff);
  if (part && part !== "all") list = list.filter((p) => p.part === part);

  const words = String(q || "")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length) {
    list = list.filter((p) => {
      const hay = (p.title + " " + p.topic + " " + (p.subtopic || "")).toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }

  list = sortDsaProblems(list, sort || "sheet");

  const size = Math.min(200, Math.max(5, Number(perPage) || 40));
  const total = list.length;

  // Poora filtered set (status filter ke liye -- wo localStorage me hai,
  // server ko nahi pata, isliye wo mode me client list ko khud kaata hai)
  if (all) return { items: list, total, page: 1, perPage: size, totalPages: 1 };

  const totalPages = Math.max(1, Math.ceil(total / size));
  let target = Math.min(Math.max(1, Number(page) || 1), totalPages);
  if (focus) {
    const idx = list.findIndex((p) => p.id === focus);
    if (idx >= 0) target = Math.floor(idx / size) + 1;
  }

  const start = (target - 1) * size;
  return {
    items: list.slice(start, start + size),
    total,
    page: target,
    perPage: size,
    totalPages,
  };
}

// Sort helper: sheet order (default) | title | difficulty.
export function sortDsaProblems(list, mode) {
  if (mode === "title") return [...list].sort((a, b) => a.title.localeCompare(b.title));
  if (mode === "difficulty") {
    return [...list].sort(
      (a, b) => (DIFF_RANK[a.difficulty] ?? 9) - (DIFF_RANK[b.difficulty] ?? 9) || a.n - b.n
    );
  }
  return [...list].sort((a, b) => a.n - b.n);
}

// Navbar search index me DSA problems bhi shamil kar dete hai. `t: "dsa"`
// marker se NavSearch jaanta hai ki result /dsa par bhejna hai (tracks par nahi).
export function getDsaSearchIndex() {
  return getDsaSheet().problems.map((p) => ({
    q: p.title,
    t: "dsa",
    tn: "DSA Sheet",
    m: null,
    i: p.id,
    l: p.topic,
  }));
}