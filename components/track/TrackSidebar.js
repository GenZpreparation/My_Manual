"use client";

// Generic sidebar list -- pehle "categories" dikhata tha, ab "modules"
// (Module 0, Module 1...) dikhata hai. Isliye prop ka naam "items" kar
// diya hai taaki naam se confusion na ho. Har item me { id, label, count }
// hona chahiye.
//
// Naya: jo module active hai (click kiya hua) wo thoda expand hota hai
// aur uske neeche ek thin layer me uss module ke andar ke topics
// (item.topics) dikh jaate hai -- bina alag se kuch click kiye, sirf
// active module ke niche.

import { useEffect, useRef } from "react";

export default function TrackSidebar({ slug, items, totalCount, activeId, onSelect, onPrefetch }) {
  const activeRef = useRef(null);

  // Mobile par rail horizontally scroll hoti hai, to active module chip
  // offscreen ho sakta hai (refresh / search se aaya ho). Use hamesha
  // dikhate hue laate hai.
  // NOTE: scrollIntoView() ki jagah manual scrollLeft -- scrollIntoView page
  // ko bhi vertical scroll kar deta tha, jo chip switch karte waqt jerk deta.
  useEffect(() => {
    const chip = activeRef.current;
    const rail = chip && chip.closest(".track-sidebar-nav");
    if (!chip || !rail) return;
    // Desktop par rail vertical hai (scrollWidth == clientWidth) -- kuch nahi karna
    if (rail.scrollWidth <= rail.clientWidth + 1) return;
    const target = chip.offsetLeft - (rail.clientWidth - chip.offsetWidth) / 2;
    rail.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [activeId]);

  return (
    <aside className="track-sidebar">
      <div className="track-sidebar-inner">
        <div className="track-sidebar-total">
          <span className="track-sidebar-num">{totalCount}</span>
          <span className="track-sidebar-label">questions in this track</span>
        </div>
        {/* Mobile rail me upar dikhta hai, desktop par sidebar ke andar */}
        <div className="track-sidebar-mobilelabel" aria-hidden="true">
          Modules
        </div>
        <nav className="track-sidebar-nav" aria-label="Modules in this track">
          {items.map((item) => {
            const isActive = activeId === item.id;
            const topics = item.topics || [];
            return (
              <div
                key={item.id}
                className={`track-sidebar-item${isActive ? " is-open" : ""}`}
                ref={isActive ? activeRef : null}
              >
                <a
                  href={slug ? `/tracks/${slug}/${item.id}` : undefined}
                  onClick={(e) => {
                    // Ctrl/Cmd/middle-click = normal link (new tab); simple click = instant lazy switch
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                    e.preventDefault();
                    onSelect(item.id);
                  }}
                  onMouseEnter={() => onPrefetch && onPrefetch(item.id)}
                  onFocus={() => onPrefetch && onPrefetch(item.id)}
                  onTouchStart={() => onPrefetch && onPrefetch(item.id)}
                  className={`track-sidebar-link${isActive ? " is-active" : ""}`}
                  aria-current={isActive ? "true" : undefined}
                >
                  <span>{item.label}</span>
                  <span className="track-sidebar-count">{item.count}</span>
                </a>

                {topics.length > 0 && (
                  <div className="track-sidebar-topics-wrap" aria-hidden={!isActive}>
                    <div className="track-sidebar-topics">
                      {topics.map((topic) => (
                        <span key={topic} className="track-sidebar-topic">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
