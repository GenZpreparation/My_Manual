"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Koi bhi element jispe class="reveal" laga ho, woh viewport me aate hi
// "in-view" class pa jaata hai (globals.css isi class pe fade+slide-up
// animation chalata hai).
//
// Ye layout.js me hai, aur next/link se page badalne par layout dobara mount
// NAHI hota -- isliye effect pathname pe depend karta hai: har route change
// (Back/Forward dabane par bhi) naye page ke .reveal elements dobara observe
// hote hai. Warna wo opacity:0 pe hi atke rehte the (hero text gayab).
export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const els = Array.from(document.querySelectorAll(".reveal:not(.in-view)"));
    if (!els.length) return;

    if (
      !("IntersectionObserver" in window) ||
      (window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    ) {
      els.forEach((el) => el.classList.add("in-view"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
