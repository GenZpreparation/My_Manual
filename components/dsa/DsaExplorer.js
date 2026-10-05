"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DsaSidebar from "@/components/dsa/DsaSidebar";
import DsaProblemRow from "@/components/dsa/DsaProblemRow";
import DsaPagination from "@/components/dsa/DsaPagination";
import useDsaProgress from "@/components/dsa/useDsaProgress";
import useDsaPaging from "@/components/dsa/useDsaPaging";
import {
  DSA_DIFFICULTIES,
  DSA_DIFF_LABEL,
  DSA_SORTS,
  DSA_STATUS_LABEL,
  DSA_STATUSES,
} from "@/lib/dsaShared";

// Ek page me kitne problems. 40 ek a comfortable number hai -- list lambi
// lagti hai bhi (scroll karne layak) aur DOM chhota bhi rehta hai.
const PER_PAGE = 40;

// Per-page options (dropdown se badal sakte ho).
const PER_PAGE_OPTIONS = [20, 40, 80, 120];

// Search + filters URL query me jaate hain (`replaceState`) -- jaise TrackView
// module switch karta hai. Isse link share karna aur reload pe filters sahi
// milna dono kaam karte hain, lekin back button filter ke beech se nahi ghoomta.

const readParams = () => {
  const p = new URLSearchParams(window.location.search);
  return {
    topic: p.get("topic") || "all",
    q: p.get("q") || "",
    diff: p.get("diff") || "all",
    part: p.get("part") || "all",
    status: p.get("status") || "all",
    sort: p.get("sort") || "sheet",
    p: p.get("p"),
    page: parseInt(p.get("page") || "1", 10) || 1,
    perPage: parseInt(p.get("perPage") || String(PER_PAGE), 10) || PER_PAGE,
  };
};

export default function DsaExplorer({ initial, topics, stats, progressIndex }) {
  const [topic, setTopic] = useState("all");
  const [query, setQuery] = useState("");
  const [diff, setDiff] = useState("all");
  const [part, setPart] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("sheet");
  const [openId, setOpenId] = useState(null);
  const [focusId, setFocusId] = useState(null);
  const searchRef = useRef(null);

  const { map, ready, get, update, clearAll, summary } = useDsaProgress(progressIndex);

  // Lazy loading + pagination ka pura data layer. Server ne pehla page bheja
  // hai (`initial`), baaki pages API se aate hain jab user page change karta
  // hai. `initialPage`/`initialPerPage` props se URL ka page/perPage bhi
  // seedha data layer me chala jaata hai (refresh par wahi page khulna
  // chahiye, hamesha page 1 nahi).
  const [perPage, setPerPage] = useState(initial.perPage || PER_PAGE);
  const { items, total, totalPages, page, from, to, status, setPage, reload } = useDsaPaging({
    filters: { topic, query, diff, part, sort },
    perPage,
    statusFilter,
    progress: map,
    ready,
    initial: { ...initial, filterKey: initial.filterKey },
    focusId,
  });

  // ---- URL -> state (pehla load, refresh, shared link) ----
  //
  // `firstWrite` ka kaam: URL padhne wala effect aur URL likhne wala effect
  // dono mount par ek hi commit me chalte hai. Likhne wala effect default
  // state ke saath chalega (state tabhi update hoti hai) -- usse likhne na
  // dein, warna `?topic=arrays` ek frame ke liye mitcha jayega. Pehla write
  // skip, dusra write (state settle hone ke baad) sahi URL likhta hai.
  const url = useRef({ applied: false, skippedFirstWrite: false });

  useEffect(() => {
    if (url.current.applied) return;
    url.current.applied = true;
 const p = readParams();
    setTopic(topics.some((t) => t.slug === p.topic) ? p.topic : "all");
    setQuery(p.q);
    setDiff(DSA_DIFFICULTIES.includes(p.diff) ? p.diff : "all");
    setPart(p.part === "A" || p.part === "B" ? p.part : "all");
    setStatusFilter(DSA_STATUSES.includes(p.status) ? p.status : "all");
    setSort(DSA_SORTS.some((s) => s.id === p.sort) ? p.sort : "sheet");
    if (PER_PAGE_OPTIONS.includes(p.perPage)) setPerPage(p.perPage);
    if (p.p) {
      // Deep link (?p=a_0042): server pehla page hi bhej chuka hai, aur data
      // layer `focus` se us problem wali page khol leta hai -- isliye yahan
      // page number guess karne ki zarurat nahi.
      setFocusId(p.p);
      setOpenId(p.p);
    }
  }, [topics]);

  // ---- state -> URL ----
  useEffect(() => {
    if (!url.current.applied) return;
    if (!url.current.skippedFirstWrite) {
      url.current.skippedFirstWrite = true;
      return;
    }
    const p = new URLSearchParams();
    if (topic !== "all") p.set("topic", topic);
    if (query.trim()) p.set("q", query.trim());
    if (diff !== "all") p.set("diff", diff);
    if (part !== "all") p.set("part", part);
    if (statusFilter !== "all") p.set("status", statusFilter);
    if (sort !== "sheet") p.set("sort", sort);
    if (page > 1) p.set("page", String(page));
    if (perPage !== PER_PAGE) p.set("perPage", String(perPage));
    if (openId) p.set("p", openId);
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `/dsa?${qs}` : "/dsa");
  }, [topic, query, diff, part, statusFilter, sort, openId, page, perPage]);

  // ---- deep link (?p=...) par scroll, list paint hone ke baad ----
  //
  // `lastOpen` isliye hai taki flash ek hi baar chale. `page`/`items` bhi is
  // effect ka part hai (lazy page aane ke baad element tabhi exist karta
  // hai), isliye bina is check ke flash baar-baar chalta.
  const lastOpen = useRef(null);
  useEffect(() => {
    if (!openId) {
      lastOpen.current = null; // band karne ke baad dobara kholne par flash chale
      return;
    }
    const raf = requestAnimationFrame(() => {
      const el = document.getElementById(`dsa-${openId}`);
      if (!el || lastOpen.current === openId) return;
      lastOpen.current = openId;
      const offset = 140; // sticky navbar + mobile chip rail
      const top = el.getBoundingClientRect().top;
      if (top < offset || top > window.innerHeight) {
        window.scrollTo({ top: window.scrollY + top - offset, behavior: "smooth" });
      }
      el.classList.add("is-flash");
      const t = setTimeout(() => el.classList.remove("is-flash"), 1600);
      return () => clearTimeout(t);
    });
    return () => cancelAnimationFrame(raf);
  }, [openId, page, items]);

  // "/" se search box focus (kisi field me type nahi kar rahe ho tabhi)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target;
      const tag = el && el.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (el && el.isContentEditable)) return;
      e.preventDefault();
      if (searchRef.current) searchRef.current.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ---- progress handlers (memoized, taaki 700 memoized rows stable rahein) ----
  const onCycle = useCallback((id, nextStatus) => update(id, { status: nextStatus }), [update]);
  const onStatus = useCallback((id, s) => update(id, { status: s }), [update]);
  const onNotes = useCallback((id, notes) => update(id, { notes }), [update]);
  const onAttempt = useCallback(
    (id, delta) => update(id, { attempts: Math.max(0, (get(id).attempts || 0) + delta) }),
    [update, get]
  );
  const onToggle = useCallback((id) => setOpenId((cur) => (cur === id ? null : id)), []);
      // galat (zero) results dikhane se behtar hai "loading" dikhana.
  const hasFilters = topic !== "all" || query || diff !== "all" || part !== "all" || statusFilter !== "all";
  const pendingStatus = statusFilter !== "all" && !ready;

  // Page change karne par list ke top pe wapas chale -- warna user pagination
  // click kare to nayi list ke upar se khada rahega (purane scroll par).
  const listTopRef = useRef(null);
  const onPage = useCallback((n) => {
    setPage(n);
    const top = listTopRef.current;
    if (!top) return;
    const y = top.getBoundingClientRect().top + window.scrollY - 150;
    window.scrollTo({ top: y, behavior: "smooth" });
  }, [setPage]);

  const onSelectTopic = useCallback((slug) => {
    setTopic(slug);
    setPage(1);
  }, [setPage]);

  const resetAll = useCallback(() => {
    setTopic("all");
    setQuery("");
    setDiff("all");
    setPart("all");
    setStatusFilter("all");
    setSort("sheet");
    setOpenId(null);
    setPage(1);
  }, [setPage]);

  const activeTopicName = topics.find((t) => t.slug === topic)?.name;
  const solvedPct = Math.round((summary.solved / stats.total) * 100);

  return (
    <section className="dsa-body">
      <div className="wrap dsa-body-grid">
        <DsaSidebar
          topics={topics}
          activeSlug={topic}
          onSelect={onSelectTopic}
          solvedByTopic={summary.byTopic}
          solved={summary.solved}
          total={stats.total}
          ready={ready}
          query={query}
        />

        <div className="dsa-content">
          {/* ---------------- Toolbar: search + filters ---------------- */}
          <div className="dsa-toolbar">
            <div className="dsa-search">
              <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M18 18L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={"Search " + stats.total + " problems by name or topic  (press / )"}
                aria-label="Search DSA problems"
              />
              {query && (
                <button type="button" className="dsa-search-clear" onClick={() => setQuery("")} aria-label="Clear search">
                  ×
                </button>
              )}
            </div>

            <div className="dsa-filters">
              <div className="dsa-filter-group" role="group" aria-label="Filter by difficulty">
                <button
                  type="button"
                  className={"dsa-filter" + (diff === "all" ? " is-active" : "")}
                  onClick={() => setDiff("all")}
                  aria-pressed={diff === "all"}
                >
                  All
                </button>
                {DSA_DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={"dsa-filter is-" + d + (diff === d ? " is-active" : "")}
                    onClick={() => setDiff(d)}
                    aria-pressed={diff === d}
                  >
                    {DSA_DIFF_LABEL[d]}
                    <span className="dsa-filter-count">{stats.difficulty[d]}</span>
                  </button>
                ))}
              </div>

              <div className="dsa-selects">
                <label className="dsa-select">
                  <span className="seo-only">Filter by source</span>
                  <select value={part} onChange={(e) => setPart(e.target.value)} aria-label="Filter by source">
                    <option value="all">All sources</option>
                    <option value="A">DSA Master Sheet ({stats.part.A})</option>
                    <option value="B">LearnYard ({stats.part.B})</option>
                  </select>
                </label>

                <label className="dsa-select">
                  <span className="seo-only">Filter by status</span>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status">
                    <option value="all">Any status</option>
                    {DSA_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {DSA_STATUS_LABEL[s]}
                        {ready && summary.byStatus[s] ? " (" + summary.byStatus[s] + ")" : ""}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="dsa-select">
                  <span className="seo-only">Sort problems</span>
                  <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort problems">
                    {DSA_SORTS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="dsa-select">
                  <span className="seo-only">Problems per page</span>
                  <select
                    value={perPage}
                    onChange={(e) => {
                      setPerPage(parseInt(e.target.value, 10) || PER_PAGE);
                      setPage(1);
                    }}
                    aria-label="Problems per page"
                  >
                    {PER_PAGE_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n} / page
                      </option>
                    ))}
                  </select>
                </label>

                {hasFilters && (
                  <button type="button" className="dsa-reset" onClick={resetAll}>
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ---------------- Result meta ---------------- */}
          <div className="dsa-result-head" ref={listTopRef}>
            <div>
              <h2 className="dsa-result-title">{activeTopicName || (query ? "Search results" : "All problems")}</h2>
              <p className="dsa-result-sub">
       <strong>{total}</strong> matching problem{total === 1 ? "" : "s"}
       {total !== stats.total ? " (of " + stats.total + " in the sheet)" : ""}
                {activeTopicName ? " in " : ""}
                {activeTopicName ? <strong>{activeTopicName}</strong> : null}
              </p>
            </div>

            {ready && summary.solved > 0 && (
              <div className="dsa-mini-progress">
                <span className="dsa-mini-num">{summary.solved}</span>
                <span className="dsa-mini-label">solved</span>
                <span className="dsa-mini-bar" aria-hidden="true">
                  <span style={{ width: solvedPct + "%" }} />
                </span>
                <button
                  type="button"
                  className="dsa-mini-clear"
                  onClick={() => {
                    if (window.confirm("Clear all saved DSA progress? This cannot be undone.")) clearAll();
                  }}
                >
                  Reset progress
                </button>
              </div>
            )}
          </div>

          {/* ---------------- List ---------------- */}
          {status === "error" ? (
            <div className="dsa-empty">
              <p className="dsa-empty-title">Problems load nahi ho paaye.</p>
              <p className="dsa-empty-sub">Connection check karke dobara try kare.</p>
              <button type="button" className="dsa-reset-btn" onClick={reload}>
                Retry
              </button>
            </div>
          ) : pendingStatus ? (
            <div className="dsa-empty">
              <p className="dsa-empty-title">Loading your saved progress…</p>
              <p className="dsa-empty-sub">Status marks are stored in this browser only — no account needed.</p>
            </div>
          ) : total === 0 && status !== "loading" ? (
            <div className="dsa-empty">
              <p className="dsa-empty-title">No problems match these filters.</p>
              <p className="dsa-empty-sub">Try a different topic, difficulty or search term.</p>
              {hasFilters && (
                <button type="button" className="dsa-reset-btn" onClick={resetAll}>
                  Reset filters
                </button>
              )}
            </div>
          ) : (
            <div className="dsa-list-wrap">
              {/* Lazy page aa rahi ho to skeleton -- user ko pata chale ki
                  kuch load ho raha hai, purani list hang nahi lagti */}
              {status === "loading" && (
                <div className="dsa-skeleton-wrap" aria-busy="true" aria-label="Loading problems">
                  {Array.from({ length: 5 }, (_, i) => (
    <div className="dsa-skeleton" key={i} />
                  ))}
                </div>
              )}

              <ul className="dsa-list">
                {items.map((p) => (
                  <DsaProblemRow
                    key={p.id}
                    problem={p}
                    entry={get(p.id)}
                    open={openId === p.id}
                    onToggle={onToggle}
                    onCycle={onCycle}
                    onStatus={onStatus}
                    onNotes={onNotes}
                    onAttempt={onAttempt}
                  />
                ))}
              </ul>

       <DsaPagination
   page={page}
   totalPages={totalPages}
  from={from}
   to={to}
   total={total}
      loading={status === "loading"}
      onPage={onPage}
           />
            </div>
          )}

          {/* Screen readers ko batata hai ki list kitni chhoti hui */}
          <p className="seo-only" role="status" aria-live="polite">
      {total} problems match your filters. Showing {from} to {to}. Page {page} of {totalPages}.
          </p>
        </div>
      </div>
    </section>
  );
}