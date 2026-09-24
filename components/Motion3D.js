"use client";

import { useEffect } from "react";

// Poore landing page ke liye interactive motion (ek hi jagah, layout.js me mount):
//  1. 3D tilt + glare   -> track cards, why cards, hero panel
//  2. Cursor spotlight  -> cursor ke peeche halki glow
//  3. Magnetic buttons  -> button cursor ki taraf khichta hai
//  4. Scroll progress   -> top pe gradient bar
// Touch devices / reduced-motion pe sirf scroll bar chalta hai.
export default function Motion3D() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    const bar = document.createElement("div");
    bar.className = "scroll-progress";
    document.body.appendChild(bar);
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    let glow, onMove, onLeave;
    if (!reduced && fine) {
      glow = document.createElement("div");
      glow.className = "cursor-glow";
      document.body.appendChild(glow);

      const TILT = ".track-card:not(.is-disabled), .why-item, .hero-panel";
      const MAG = ".btn-primary, .btn-ghost, .footer-cta-btn";
      let active = null;

      const reset = (el) => {
        if (!el) return;
        el.classList.remove("is-tilting");
        el.style.removeProperty("--rx");
        el.style.removeProperty("--ry");
      };

      let last;
      let raf = 0;
      const process = (e) => {
        glow.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        glow.style.opacity = "1";

        const card = e.target.closest && e.target.closest(TILT);
        if (active && active !== card) reset(active);
        active = card;
        if (card) {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width;
          const py = (e.clientY - r.top) / r.height;
          card.classList.add("is-tilting");
          card.style.setProperty("--rx", `${((0.5 - py) * 12).toFixed(2)}deg`);
          card.style.setProperty("--ry", `${((px - 0.5) * 14).toFixed(2)}deg`);
          card.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
          card.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
        }

        document.querySelectorAll(MAG).forEach((b) => {
          const r = b.getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width / 2);
          const dy = e.clientY - (r.top + r.height / 2);
          const near = Math.hypot(dx, dy) < Math.max(r.width, 120);
          b.style.translate = near ? `${dx * 0.22}px ${dy * 0.3}px` : "";
        });
      };
      // rAF throttle: getBoundingClientRect ab har event pe nahi, frame me sirf ek baar
      onMove = (e) => {
        last = e;
        if (!raf) raf = requestAnimationFrame(() => { raf = 0; process(last); });
      };
      onLeave = () => {
        glow.style.opacity = "0";
        reset(active);
        active = null;
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerleave", onLeave);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (onMove) window.removeEventListener("pointermove", onMove);
      if (onLeave) document.removeEventListener("pointerleave", onLeave);
      bar.remove();
      if (glow) glow.remove();
    };
  }, []);

  return null;
}
