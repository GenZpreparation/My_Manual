"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

// Navbar search: question-titles ka halka index pehli baar focus hone par hi
// (lazy) download hota hai. Result click -> sahi module + question khulta hai.
export default function NavSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const [term, setTerm] = useState("");
  const [index, setIndex] = useState(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const loadIndex = () => {
    if (index) return;
    fetch("/api/search")
      .then((r) => r.json())
      .then(setIndex)
      .catch(() => setIndex([]));
  };

  const words = term.toLowerCase().split(/\s+/).filter(Boolean);
  const ready = term.trim().length >= 2 && index;
  const results = ready
    ? index.filter((x) => words.every((w) => x.q.toLowerCase().includes(w))).slice(0, 8)
    : [];

  const go = (r) => {
    setOpen(false);
    setTerm("");
    const base = `/tracks/${r.t}`;
    const url = `${base}/${r.m}?q=${r.i}`;
    if (pathname === base || pathname.startsWith(`${base}/`)) {
      window.dispatchEvent(new CustomEvent("manual:goto", { detail: r }));
    } else {
      router.push(url);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") setOpen(false);
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) go(results[active]);
  };

  return (
    <div
      className="nav-search-wrap"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <label className="nav-search">
        <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M18 18L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          placeholder="Search a question"
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => {
            loadIndex();
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          aria-label="Search questions"
        />
      </label>

      {open && term.trim().length >= 2 && (
        <ul className="nav-results" role="listbox">
          {!index && <li className="nav-result-empty">Searching…</li>}
          {index && results.length === 0 && <li className="nav-result-empty">No questions found</li>}
          {results.map((r, i) => (
            <li key={`${r.t}-${r.m}-${r.i}`} role="option" aria-selected={i === active}>
              <button
                type="button"
                className={`nav-result${i === active ? " is-active" : ""}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(r)}
              >
                {r.q}
                <small>{r.tn} · {r.l}</small>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
