"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// DSA list ka data layer: lazy loading + caching + pagination.
//
// Pehle poori list har page load par client ko bhejti thi (~220 KB) aur "load
// more" se chhoti chhoti deti thi. Ab:
//   * Server sirf pehla page bhejta hai (SEO + fast first paint).
//   * Baaki pages `/api/dsa/problems` se aate hai -- sirf jab zaroori ho.
//   * Har (filter, page) combination memory me cache hota hai, isliye peeche
//     jaakar wapas aana dobara network call nahi karta.

const cacheKey = (filterKey, page) => `${filterKey}::p${page}`;

export default function useDsaPaging({ filters, perPage, statusFilter, progress, ready, initial, focusId }) {
  // Filter set ko ek string me bake karta hai -- isse cache key banana halka
  // ho jaata hai aur dependencies simple rehti hain.
  const filterKey = useMemo(
    () =>
      JSON.stringify({
        topic: filters.topic,
        q: filters.query.trim(),
        diff: filters.diff,
        part: filters.part,
        sort: filters.sort,
      }),
    [filters.topic, filters.query, filters.diff, filters.part, filters.sort]
  );

  const [page, setPage] = useState(1);
  const [data, setData] = useState(initial);
  const [status, setStatus] = useState("ready"); // ready | loading | error
  const cache = useRef(new Map([[cacheKey(initial.filterKey, initial.page), initial]]));
  const reqId = useRef(0);

  // Status localStorage me hai, server ko nahi pata -- isliye status filter
  // ON hone par poora filtered set ek baar maangte hain aur baad me client
  // hi kaat-ta hai. Warna har page ka count galat aa raha tha.
  const statusMode = statusFilter !== "all";

  const buildUrl = useCallback(
    (pageNo, opts) => {
      const p = new URLSearchParams();
      const f = JSON.parse(filterKey);
      if (f.topic && f.topic !== "all") p.set("topic", f.topic);
      if (f.q) p.set("q", f.q);
      if (f.diff !== "all") p.set("diff", f.diff);
      if (f.part !== "all") p.set("part", f.part);
      if (f.sort && f.sort !== "sheet") p.set("sort", f.sort);
      p.set("perPage", String(perPage));
      if (opts && opts.all) p.set("all", "1");
      else p.set("page", String(pageNo));
      if (opts && opts.focus) p.set("focus", opts.focus);
      return `/api/dsa/problems?${p.toString()}`;
    },
    [filterKey, perPage]
  );

  const fetchPage = useCallback(
    async (pageNo, opts) => {
      // Focus wala request apna alag cache key rakhta hai. Warna wo server
      // se bheje pehle page wale entry ko hi dekh leta (`::p1`) aur deep-link
      // kabhi apni sahi page par nahi pahunchta.
      const focus = opts && opts.focus;
      const key =
        opts && opts.all
          ? `${filterKey}::all`
          : focus
            ? `${filterKey}::focus-${focus}-${pageNo}`
            : cacheKey(filterKey, pageNo);
      const hit = cache.current.get(key);
      if (hit) return hit;

      const res = await fetch(buildUrl(pageNo, opts));
      if (!res.ok) throw new Error("dsa fetch failed");
      const json = await res.json();
      const entry = { ...json, filterKey };
      cache.current.set(key, entry);
      return entry;
    },
    [buildUrl, filterKey]
  );

  // ---- Filters ya page badalne par data lao ----
  useEffect(() => {
    const req = ++reqId.current;
    let cancelled = false;

    // Naya filter/page par purana data dikhana (stale) user ko confuse karta
    // hai -- isliye loading state dikhate hain.
    setStatus("loading");

    fetchPage(page, { all: statusMode, focus: statusMode ? null : focusId })
      .then((json) => {
        if (cancelled || req !== reqId.current) return;
        setData(json);
        setStatus("ready");
        // Server ne page redirect kiya (deep-link jump, ya page range se
        // bahar) -- local page state bhi usi par set karo, warna pagination
        // controls galat page number highlight karenge.
        if (!statusMode && json.page && json.page !== page) setPage(json.page);
      })
      .catch(() => {
      if (cancelled || req !== reqId.current) return;
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [fetchPage, page, statusMode, focusId]);

  // Filters badalne par wapas page 1 -- warna user page 12 par topic switch
  // kare to "kuch nahi mila" dikhta hai.
  useEffect(() => {
    setPage(1);
  }, [filterKey]);

  // ---- Derived list ----
  const view = useMemo(() => {
    const per = perPage;
    let list = data.items || [];

    if (statusMode) {
      // Server ne pure filtered set bheja tha; status yahin apply hota hai.
      if (!ready) return { items: [], total: 0, totalPages: 1, page: 1, from: 0, to: 0 };
      list = list.filter((p) => (progress[p.id]?.status || "pending") === statusFilter);
    }

    const total = statusMode ? list.length : data.total;
    const totalPages = statusMode ? Math.max(1, Math.ceil(total / per)) : data.totalPages;
    const safePage = Math.min(Math.max(1, page), totalPages);

    // Server-mode me `data` already current page ka slice hai -- dobara slice
    // karne se problem chhooti ho jati hai. Client-mode me khud slice karna
    // padta hai.
    const items = statusMode ? list.slice((safePage - 1) * per, safePage * per) : list;
    const from = total === 0 ? 0 : (safePage - 1) * per + 1;
    const to = statusMode ? Math.min(safePage * per, total) : from + items.length - 1;

    return { items, total, totalPages, page: safePage, from, to };
  }, [data, page, perPage, statusMode, statusFilter, progress, ready]);

  // ---- Agli page prefetch ----
  // User ko "Next" dabane ka wait nahi karna padta -- jaise hi current page
  // render hota hai, agli page peeche se hi aa jaati hai.
  useEffect(() => {
    if (statusMode || status !== "ready") return;
    const next = page + 1;
    if (next > view.totalPages) return;
    if (cache.current.has(cacheKey(filterKey, next))) return;
    const t = setTimeout(() => {
      fetchPage(next).catch(() => {});
    }, 400);
    return () => clearTimeout(t);
  }, [page, statusMode, status, view.totalPages, filterKey, fetchPage]);

  const reload = useCallback(() => {
    cache.current.clear();
    reqId.current += 1;
    setStatus("loading");
    fetchPage(page, { all: statusMode, focus: statusMode ? null : focusId })
      .then((json) => {
        setData(json);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [fetchPage, page, statusMode, focusId]);

  return { ...view, status, setPage, reload };
}