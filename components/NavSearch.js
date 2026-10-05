"use client";

import { useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

// Relevance: jo title word ke shuru me match ho use upar, chhota title aur
// jaldi occurrence pehle. Bina iske "string" likhne par None/0/False wala
// question sabse upar aa raha tha.
function relevance(question, phrase) {
  const q = question.toLowerCase();
  const at = q.indexOf(phrase);
  if (at === -1) return 0;
  let score = 10;
  if (at === 0) score += 50; // title ke shuru me hai
  else if (/\s/.test(q[at - 1])) score += 30; // poore word ke roop me hai
  score += Math.max(0, 20 - at * 2); // jaldi occurrence behtar
  score += Math.max(0, 18 - question.length / 5); // chhota title behtar
  return score;
}

// Navbar search: question-titles ka halka index pehli baar focus hone par hi
// (lazy) download hota hai. Result click -> sahi module + question khulta hai.
// onNavigate: mobile menu band karne ke liye (result select par).
export default function NavSearch({ onNavigate }) {
  const router = useRouter();
  const pathname = usePathname();
  const [term, setTerm] = useState("");
  const [index, setIndex] = useState(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);

  const loadIndex = () => {
    if (index) return;
    fetch("/api/search")
      .then((r) => r.json())
      .then(setIndex)
      .catch(() => setIndex([]));
  };

  const phrase = term.trim().toLowerCase();
  const words = phrase.split(/\s+/).filter(Boolean);
  const ready = phrase.length >= 2 && index;
  const results = ready
    ? index
        .filter((x) => words.every((w) => x.q.toLowerCase().includes(w)))
        .map((x) => ({ x, s: relevance(x.q, phrase) }))
        .sort((a, b) => b.s - a.s)
        .slice(0, 8)
        .map(({ x }) => x)
    : [];

  const go = (r) => {
    // Mobile par keyboard band karo, warna dropdown scroll karta hua dikhta hai.
    if (inputRef.current) inputRef.current.blur();
    setOpen(false);
    setTerm("");
    if (onNavigate) onNavigate();
    // DSA sheet ke problems alag page (/dsa) rehte hai -- unhe `?p=<id>` se
    // kholte hain, taaki search result seedha sahi problem par scroll ho.
    if (r.t === "dsa") {
      router.push(`/dsa?p=${encodeURIComponent(r.i)}`);
      return;
    }
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
    } else if (e.key === "Enter" && results[active]) {
      // Mobile keyboard ka "Go"/"Search" key bhi yahi se trigger hota hai.
      e.preventDefault();
      go(results[active]);
    }
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
          ref={inputRef}
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
