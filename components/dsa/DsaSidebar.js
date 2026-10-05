"use client";

import { useEffect, useRef } from "react";

// Topic list + har topic ka solved progress. Desktop par sticky sidebar,
// mobile par horizontally scrollable chip rail (TrackSidebar jaisa hi pattern,
// isliye dono pages ka navigation behaviour ek jaisa lagta hai).

export default function DsaSidebar({ topics, activeSlug, onSelect, solvedByTopic, solved, total, ready, query }) {
  const chips = useRef([]);

  // Mobile rail par active chip offscreen ho sakta hai (search / deep-link se
  // aaya ho) -- use hamesha visible laate hai. Desktop par rail vertical hai,
  // scrollWidth == clientWidth hota hai, to kuch nahi karte.
  useEffect(() => {
    const i = topics.findIndex((t) => t.slug === activeSlug);
    const chip = chips.current[i + 1];
    const rail = chip && chip.parentElement;
    if (!chip || !rail) return;
    if (rail.scrollWidth <= rail.clientWidth + 1) return;
    if (rail.scrollLeft <= 0) return;
    const left = chip.offsetLeft - (rail.clientWidth - chip.offsetWidth) / 2;
    rail.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [activeSlug, topics]);

  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;

  return (
    <aside className="dsa-sidebar">
      <div className="dsa-sidebar-inner">
        <div className="dsa-sidebar-total">
          <span className="dsa-sidebar-num">{total}</span>
          <span className="dsa-sidebar-label">problems in this sheet</span>
        </div>

        <div className="dsa-sidebar-progress" data-ready={ready ? "true" : "false"}>
          <div className="dsa-progress-head">
            <span>Your progress</span>
            <strong>{ready ? solved + "/" + total : "0/" + total}</strong>
          </div>
          <div
            className="dsa-progress-bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={solved}
            aria-label="Problems solved"
          >
            <span style={{ width: pct + "%" }} />
          </div>
          <span className="dsa-progress-caption">
            {ready ? pct + "% solved" : "Loading your progress..."}
          </span>
        </div>

        {/* Mobile rail par upar dikhta hai, desktop par sidebar ke andar */}
        <div className="dsa-sidebar-mobilelabel" aria-hidden="true">
          Topics
        </div>

        <nav className="dsa-sidebar-nav" aria-label="DSA topics">
          <button
            type="button"
            className={"dsa-sidebar-link is-all" + (activeSlug === "all" ? " is-active" : "")}
            onClick={() => onSelect("all")}
            aria-current={activeSlug === "all" ? "true" : undefined}
          >
            <span className="dsa-sidebar-name">{query ? "Search results" : "All topics"}</span>
            <span className="dsa-sidebar-count">{total}</span>
          </button>

          {topics.map((t, i) => {
            const done = (solvedByTopic[t.name] && solvedByTopic[t.name].solved) || 0;
            const isActive = activeSlug === t.slug;
            return (
              <button
                key={t.slug}
                type="button"
                ref={(el) => {
                  chips.current[i + 1] = el;
                }}
                className={"dsa-sidebar-link" + (isActive ? " is-active" : "")}
                onClick={() => onSelect(t.slug)}
                aria-current={isActive ? "true" : undefined}
                title={t.name + " — " + t.total + " problems (" + t.easy + " easy, " + t.medium + " medium, " + t.hard + " hard)"}
              >
                <span className="dsa-sidebar-name">{t.name}</span>
                <span className="dsa-sidebar-meta">
                  {done > 0 && (
                    <span className="dsa-sidebar-done" aria-label={done + " solved"}>
                      {done}
                    </span>
                  )}
                  <span className="dsa-sidebar-count">{t.total}</span>
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}