"use client";

// Lazy loading: page ke saath sirf module META + PEHLE module ke questions aate
// hai. Baaki modules sidebar pe hover/click hone par /api/tracks/[slug]/[id] se aate
// hai aur cache ho jaate hai. URL (?m=module_3&q=4) sync rehta hai, isliye
// refresh / share / search-result click sab sahi module aur question kholte hai.

import { useCallback, useEffect, useRef, useState } from "react";
import TrackSidebar from "@/components/track/TrackSidebar";
import QuestionList from "@/components/track/QuestionList";

export default function TrackView({ slug, modules, totalCount, initialId, initialQuestions }) {
  const cache = useRef({ [initialId]: initialQuestions });
  const reqRef = useRef(0);
  const shouldScroll = useRef(false);
  const [activeId, setActiveId] = useState(initialId);
  const [openQ, setOpenQ] = useState(null);
  const [questions, setQuestions] = useState(initialQuestions);
  const [status, setStatus] = useState("ready"); // ready | loading | error

  const load = useCallback(async (id) => {
    if (cache.current[id]) return cache.current[id];
    const res = await fetch(`/api/tracks/${slug}/${id}`);
    if (!res.ok) throw new Error("load failed");
    cache.current[id] = await res.json();
    return cache.current[id];
  }, [slug]);

  const select = useCallback(
    async (id, q = null) => {
      if (!modules.some((m) => m.id === id)) return;
      const req = ++reqRef.current;
      shouldScroll.current = true;
      setActiveId(id);
      setOpenQ(q);
      window.history.replaceState(null, "", `/tracks/${slug}/${id}${q != null ? `?q=${q}` : ""}`);
      try {
        if (!cache.current[id]) setStatus("loading");
        const data = await load(id);
        if (req !== reqRef.current) return; // user ne tab tak kuch aur click kar diya
        setQuestions(data);
        setStatus("ready");
      } catch {
        if (req === reqRef.current) setStatus("error");
      }
    },
    [modules, load, slug]
  );

  // URL se aane wala module/question (refresh, shared link, search result)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const m = p.get("m");
    const q = p.get("q") != null ? parseInt(p.get("q"), 10) : null;
    if (m && m !== initialId) select(m, q); // purane ?m= links bhi chalte hai
    else if (q != null && !Number.isNaN(q)) {
      shouldScroll.current = true;
      setOpenQ(q);
    }
  }, [initialId, select]);

  // Navbar search se same page pe jump
  useEffect(() => {
    const onGoto = (e) => e.detail.t === slug && select(e.detail.m, e.detail.i);
    window.addEventListener("manual:goto", onGoto);
    return () => window.removeEventListener("manual:goto", onGoto);
  }, [select, slug]);

  // Content ready hone ke baad sahi jagah scroll
  useEffect(() => {
    if (status !== "ready" || !shouldScroll.current) return;
    shouldScroll.current = false;
    const raf = requestAnimationFrame(() => {
      const target =
        openQ != null ? document.getElementById(`qa-${openQ}`) : document.getElementById(activeId);
      if (!target) return;
      // Sticky navbar + (mobile par) sticky module rail dono content ke upar
      // rehte hain, isliye scroll-margin hata kar thoda neeche rakhte hain.
      const offset = 140;
      const top = target.getBoundingClientRect().top;
      if (openQ != null) target.scrollIntoView({ behavior: "smooth", block: "center" });
      else if (top < offset) {
        window.scrollTo({ top: window.scrollY + top - offset, behavior: "smooth" });
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [status, questions, openQ, activeId]);

  const activeModule = modules.find((m) => m.id === activeId) || modules[0];
  const activeIndex = modules.findIndex((m) => m.id === activeId);

  return (
    <section className="track-body">
      <div className="wrap track-body-grid">
        <TrackSidebar
          slug={slug}
          items={modules}
          totalCount={totalCount}
          activeId={activeModule?.id}
          activeIndex={activeIndex}
          onSelect={select}
          onPrefetch={(id) => load(id).catch(() => {})}
        />

        <div className="track-content">
          {activeModule && (
            <div className="qa-category" id={activeModule.id}>
              <div className="qa-category-head">
                <div className="qa-category-headings">
                  <span className="qa-category-index">
                    Module {activeIndex >= 0 ? activeIndex + 1 : ""} of {modules.length}
                  </span>
                  <h2>{activeModule.title || activeModule.label}</h2>
                </div>
                <span className="qa-category-count">{activeModule.count} questions</span>
              </div>
              {activeModule.description && (
                <p className="qa-category-desc">{activeModule.description}</p>
              )}

              {/* screen readers ko batata hai ki content badal raha hai */}
              <p className="seo-only" role="status" aria-live="polite">
                {status === "loading" && `Loading ${activeModule.label} questions`}
                {status === "error" && `Could not load ${activeModule.label} questions`}
                {status === "ready" && `${activeModule.label}: ${questions.length} questions`}
              </p>

              {status === "loading" && (
                <div aria-busy="true" aria-label="Loading questions">
                  {Array.from({ length: 6 }, (_, i) => (
                    <div className="qa-skeleton" key={i} />
                  ))}
                </div>
              )}
              {status === "error" && (
                <div className="qa-error">
                  Questions load nahi ho paaye.{" "}
                  <button type="button" onClick={() => select(activeId, openQ)}>
                    Retry
                  </button>
                </div>
              )}
              {status === "ready" && (
                <QuestionList
                  key={`${activeId}:${openQ}`}
                  category={{ questions }}
                  startIndex={0}
                  defaultOpen={openQ}
                  renderAll={activeId === initialId}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
