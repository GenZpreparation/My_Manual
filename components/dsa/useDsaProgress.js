"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DSA_PROGRESS_KEY, emptyProgress } from "@/lib/dsaShared";

// Progress browser ke localStorage me rehta hai -- koi login nahi, koi backend
// nahi. Sheet ke saath aata koi bhi data change nahi hota, sirf user ka apna
// record usi browser me save/merge hota hai.
//
// Do cheezein dhyan rakhni hai:
//  1) localStorage sirf browser me hota hai -- isliye state hamesha
//     `emptyProgress` se start hoti hai aur mount ke baad load hoti hai.
//     Server-rendered HTML aur pehla client render same hote hai (hydration
//     mismatch nahi), phir user ka data aata hai.
//  2) typing ke dauraan localStorage likhna chahiye nahi -- isliye `update`
//     memory turant badalta hai, disk par likhne ke liye debounce hota hai.

const load = () => {
  try {
    const raw = window.localStorage.getItem(DSA_PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    // har entry ko normalise karo -- purana/corrupt data se app na toote
    const out = {};
    for (const [id, v] of Object.entries(parsed)) {
      if (!v || typeof v !== "object") continue;
      out[id] = {
        status: typeof v.status === "string" ? v.status : "pending",
        notes: typeof v.notes === "string" ? v.notes : "",
        attempts: Number.isFinite(v.attempts) ? v.attempts : 0,
      };
    }
    return out;
  } catch {
    return {}; // private mode / corrupt JSON -- sheet phir bhi kaam kare
  }
};

export default function useDsaProgress(problems) {
  const [map, setMap] = useState({});
  const [ready, setReady] = useState(false);
  const timer = useRef(null);

  // Mount ke baad hi localStorage padho (client-only data)
  useEffect(() => {
    setMap(load());
    setReady(true);
  }, []);

  // Debounced persist
  useEffect(() => {
    if (!ready) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      try {
        window.localStorage.setItem(DSA_PROGRESS_KEY, JSON.stringify(map));
      } catch {
        /* quota full / private mode -- chup-chaap ignore, app chalta rahe */
      }
    }, 250);
    return () => timer.current && clearTimeout(timer.current);
  }, [map, ready]);

  // `get` ko map se nahi, ref se padhna zaroori hai. Agar iska dependency
  // `map` hota, to har progress change par naya function banta aur har row
  // ka `entry={get(p.id)}` naya object refernce le kar `memo()` ko tod deta
  // -- matlab 700 rows ka React reconciliation har click pe.
  const mapRef = useRef(map);
  mapRef.current = map;

  const get = useCallback((id) => mapRef.current[id] || emptyProgress, []);

  const update = useCallback((id, patch) => {
    setMap((cur) => {
      const prev = cur[id] || emptyProgress;
      const next = { ...prev, ...patch };
      // Kuch bhi set nahi hua to naya object mat banao (re-render bachega)
      const same =
        prev.status === next.status &&
        prev.notes === next.notes &&
        prev.attempts === next.attempts;
      if (same) return cur;
      return { ...cur, [id]: next };
    });
  }, []);

  const clearAll = useCallback(() => {
    setMap({});
    try {
      window.localStorage.removeItem(DSA_PROGRESS_KEY);
    } catch {}
  }, []);

  // Overall + per-topic summary. `ready` false tak 0 hi dikhega, warna
  // hydration ke turant baad number badal kar layout hil jayega.
  const summary = useMemo(() => {
    const byStatus = {};
    const byTopic = {};
    let solved = 0;
    let touched = 0;
    let attempts = 0;

    for (const p of problems) {
      const entry = map[p.id];
      const slot = (byTopic[p.topic] ||= { solved: 0, total: 0 });
      slot.total += 1;
      if (!entry) continue;
      attempts += entry.attempts || 0;
      byStatus[entry.status] = (byStatus[entry.status] || 0) + 1;
      if (entry.status !== "pending") touched += 1;
      if (entry.status === "solved") {
        solved += 1;
        slot.solved += 1;
      }
    }

    return { byStatus, byTopic, solved, touched, attempts, total: problems.length };
  }, [map, problems]);

  return { map, ready, get, update, clearAll, summary };
}