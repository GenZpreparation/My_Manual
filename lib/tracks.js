import fs from "fs";
import path from "path";
import { getDsaSearchIndex } from "@/lib/dsa";

// data/<track-slug>/{track.json, module_N.json ...} se saare tracks load karta hai.
// Naya language = naya folder (data/README.md dekho) -- yahan kuch badalna nahi padta.
// Production me ek baar parse hoke cache hota hai; dev me har request pe fresh
// padhta hai taaki naya JSON add karne par restart na karna pade.

const dataDir = path.join(process.cwd(), "data");
const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf-8"));
const numOf = (f) => parseInt(f.match(/\d+/)?.[0] ?? "0", 10);

function loadModule(dir, file) {
  const data = readJson(path.join(dir, file));
  const catName = new Map((data.categories || []).map((c) => [c.id, c.name]));
  const questions = (data.questions || []).map((q) => ({
    q: q.question,
    a: q.answer,
    categoryLabel: catName.get(q.category) || null,
  }));
  const topics = (data.categories || []).map((c) => c.name).filter(Boolean);
  const meta = data.meta || {};
  return {
    id: file.replace(/\.json$/i, ""),
    label:
      meta.module ||
      (meta.module_number != null ? `Module ${meta.module_number}` : null) ||
      meta.title || meta.module_name || file,
    title: meta.title || meta.module_name || "",
    description: meta.description || "",
    level: meta.level || meta.detail_level || "",
    topics: topics.length ? topics : [...new Set(questions.map((q) => q.categoryLabel).filter(Boolean))],
    count: questions.length,
    updated: fs.statSync(path.join(dir, file)).mtime.toISOString(),
    questions,
  };
}

function loadTrack(slug) {
  const dir = path.join(dataDir, slug);
  let info = {};
  try { info = readJson(path.join(dir, "track.json")); } catch {}
  const modules = fs
    .readdirSync(dir)
    .filter((f) => /^module_\d+.*\.json$/i.test(f))
    .sort((a, b) => numOf(a) - numOf(b))
    .map((f) => loadModule(dir, f));
  const total = modules.reduce((s, m) => s + m.count, 0);
  // `route` track.json me optional hai -- iska matlab "is track ka apna alag
  // page hai" (jaise DSA ka /dsa, jo module_N.json se nahi banta). Aise track
  // ko "Coming soon" mat dikhao, warna homepage card dead link lagega, aur
  // unka apna `count` track.json se aata hai (module files nahi hain).
  const customRoute = typeof info.route === "string" ? info.route : null;
  const comingSoon = modules.length === 0 && !customRoute;
  const count = customRoute ? Number(info.count) || 0 : total;
  return {
    slug,
    index: info.index || "--",
    name: info.name || slug,
    icon: info.icon || "📘",
    comingSoon,
    customRoute,
    href: comingSoon ? undefined : customRoute || `/tracks/${slug}`,
    meta: comingSoon
      ? info.meta || ""
      : customRoute
        ? info.meta || ""
        : `${total} questions · ${modules.length} module${modules.length === 1 ? "" : "s"}`,
    questionCount: comingSoon ? "Coming soon" : `${count} ${customRoute ? "problems" : "questions"}`,
    totalCount: count,
    tagline: `${modules.length} module${modules.length === 1 ? "" : "s"} · ${total} questions`,
    intro: modules[0]?.description || info.meta || `${info.name || slug} interview questions.`,
    modules,
  };
}

let cache;
function all() {
  if (cache && process.env.NODE_ENV === "production") return cache;
  cache = fs
    .readdirSync(dataDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !/^[_.]/.test(d.name))
    .map((d) => loadTrack(d.name))
    .sort((a, b) => String(a.index).localeCompare(String(b.index), undefined, { numeric: true }));
  return cache;
}

// Home / navbar / footer: halka list (questions ke bina)
export const getTracks = () => all().map(({ modules, intro, tagline, ...t }) => t);

// Track page: module META + pehle module ke questions (baaki lazy aate hai)
// moduleId nahi diya to pehla module active hota hai (track root URL).
export function getTrack(slug, moduleId) {
  const t = all().find((x) => x.slug === slug);
  if (!t) return null;
  // Jiska apna route hai (dsa -> /dsa), uska /tracks/<slug> page exist nahi
  // karta -- notFound() ke liye null return karo.
  if (t.customRoute) return null;
  const active = moduleId ? t.modules.find((m) => m.id === moduleId) : t.modules[0];
  if (moduleId && !active) return null;
  const strip = ({ questions, ...m }) => m;
  return {
    ...t,
    modules: t.modules.map(strip),
    isFirst: !moduleId || active === t.modules[0],
    activeId: active?.id,
    activeModule: active ? strip(active) : null,
    activeQuestions: active?.questions ?? [],
  };
}

export const getSitemapEntries = () =>
  all().flatMap((t) =>
    t.modules.map((m, i) => ({ slug: t.slug, id: m.id, updated: m.updated, first: i === 0 }))
  );

export const getModuleQuestions = (slug, id) =>
  all().find((t) => t.slug === slug)?.modules.find((m) => m.id === id)?.questions ?? null;

export const getAllModuleParams = () =>
  all().flatMap((t) => t.modules.map((m) => ({ slug: t.slug, id: m.id })));

// Navbar search: saare tracks ke question titles
export const getSearchIndex = () =>
  all()
    .flatMap((t) =>
      t.modules.flatMap((m) =>
        m.questions.map((x, i) => ({ q: x.q, t: t.slug, tn: t.name, m: m.id, i, l: m.label }))
      )
    )
    // DSA sheet ke problems bhi search me aane chahiye. Ye lazy import hai
    // (tracks.js -> dsa.js), dono server-only hain to koi cycle nahi banta.
    .concat(getDsaSearchIndex());
