"use client";

// Code block with two small quality-of-life actions that every dev-facing
// page needs and the raw <pre> did not have:
//   1. "Copy"  -- clipboard write + a short "Copied" confirmation.
//   2. "Wrap"  -- long lines scroll horizontally by default (keeps code
//                 readable), but on a phone that hides half the line, so the
//                 reader can flip it to soft-wrap instead.
// Both are progressive enhancement: without JS the <pre> still renders the
// code, just without the toolbar.

import { useCallback, useEffect, useRef, useState } from "react";

export default function CodeBlock({ code, lang = "", label = "Code", bare = false }) {
  const [copied, setCopied] = useState(false);
  const [wrap, setWrap] = useState(false);
  const [scrollable, setScrollable] = useState(false);
  const timer = useRef(null);
  const preRef = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  // Sirf wahi code block keyboard focusable banega jo actually horizontal
  // scroll hota hai. Warna ek page par 50+ extra tab-stop aate, aur keyboard
  // se question tak pahunchna mushkil ho jata. (WCAG: scrollable region
  // keyboard se scroll hona chahiye -- isliye check kiya, hardcode nahi kiya.)
  useEffect(() => {
    const el = preRef.current;
    if (!el) return;
    const check = () => setScrollable(el.scrollWidth > el.clientWidth + 1);
    check();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [wrap]);

  const copy = useCallback(async () => {
    const text = typeof code === "string" ? code : String(code ?? "");
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // http:// (ya old browser) me clipboard API nahi hota -- textarea trick
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }, [code]);

  const lineCount = typeof code === "string" ? code.split("\n").length : 0;
  const langLabel = (lang || "text").toUpperCase();

  return (
    <div className={`qa-code${bare ? " qa-code-bare" : ""}${wrap ? " is-wrap" : ""}`}>
      <div className="qa-code-bar">
        <span className="qa-code-lang" aria-hidden="true">
          {langLabel}
        </span>
        <div className="qa-code-tools">
          {lineCount > 3 && (
            <button
              type="button"
              className="qa-code-btn"
              onClick={() => setWrap((w) => !w)}
              aria-pressed={wrap}
            >
              {wrap ? "No wrap" : "Wrap"}
            </button>
          )}
          <button type="button" className="qa-code-btn" onClick={copy}>
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
      <pre
        ref={preRef}
        className="qa-code-block"
        tabIndex={scrollable ? 0 : -1}
        aria-label={`${label} (${lineCount} lines)`}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}
