"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import NavSearch from "@/components/NavSearch";

export default function Navbar({ tracks: tracksProp }) {
  const navTracks = tracksProp || [];
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [tracksOpen, setTracksOpen] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // header ki actual height ko CSS var me rakhte hai taaki mobile menu
  // hamesha navbar ke bilkul niche se shuru ho, chahe height kuch bhi ho.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const setH = () => document.documentElement.style.setProperty("--nav-h", `${header.offsetHeight}px`);
    setH();
    window.addEventListener("resize", setH);
    return () => window.removeEventListener("resize", setH);
  }, []);

  // Menu khula ho to background scroll lock, aur Escape se band ho jaaye.
  useEffect(() => {
    document.body.classList.toggle("no-scroll", open);
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const closeMenu = () => {
    setOpen(false);
    setTracksOpen(false);
  };

  return (
    <header className={`nav${scrolled ? " is-scrolled" : ""}`} id="siteNav" ref={headerRef}>
      <div className="nav-inner">
        <Link href="/" className="brand" onClick={closeMenu}>
          <span className="logo-mark">M</span>
          <span className="brand-text">The Interview Manual</span>
        </Link>

        <nav className="nav-links">
          <div className="nav-item">
            <Link href="/#tracks">
              Tracks <span className="chev">⌄</span>
            </Link>
            <div className="dropdown">
              <div className="dropdown-grid">
                {navTracks.map((track) =>
                  track.comingSoon ? (
                    <div
                      className="dropdown-item is-disabled"
                      key={track.name}
                      aria-disabled="true"
                    >
                      <span className="dropdown-name">{track.name}</span>
                      <span className="dropdown-count">Coming soon</span>
                    </div>
                  ) : (
                    <Link
                      className="dropdown-item"
                      href={track.href}
                      key={track.name}
                    >
                      <span className="dropdown-name">{track.name}</span>
                      <span className="dropdown-count">{track.questionCount}</span>
                    </Link>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="nav-item">
            <Link href="/#why">Why this</Link>
          </div>

          <NavSearch />

          <Link className="nav-cta" href="/#tracks">
            Start practicing
          </Link>

          <ThemeToggle />
        </nav>

        <div className="nav-actions">
          <ThemeToggle />
          <button
            type="button"
            className="nav-toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobileMenu"
            onClick={() => setOpen((o) => !o)}
          >
            <span className={`nav-toggle-bars${open ? " is-open" : ""}`} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      <div
        id="mobileMenu"
        className={`nav-mobile${open ? " is-open" : ""}`}
        aria-hidden={!open}
      >
        <div className="mobile-search">
          <NavSearch />
        </div>

        <nav className="mobile-nav-links">
          <div className={`mobile-accordion${tracksOpen ? " is-open" : ""}`}>
            <button
              type="button"
              className="mobile-accordion-trigger"
              onClick={() => setTracksOpen((o) => !o)}
              aria-expanded={tracksOpen}
            >
              Tracks <span className="chev">⌄</span>
            </button>
            <div className="mobile-accordion-panel">
              <ul className="mobile-track-list">
                {navTracks.map((track) =>
                  track.comingSoon ? (
                    <li key={track.name} className="is-disabled" aria-disabled="true">
                      <span>{track.name}</span>
                      <span className="mobile-track-count">Coming soon</span>
                    </li>
                  ) : (
                    <li key={track.name}>
                      <Link href={track.href} onClick={closeMenu}>
                        <span>{track.name}</span>
                        <span className="mobile-track-count">{track.questionCount}</span>
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>

          <Link href="/#why" className="mobile-nav-link" onClick={closeMenu}>
            Why this
          </Link>

          <Link className="nav-cta mobile-nav-cta" href="/#tracks" onClick={closeMenu}>
            Start practicing
          </Link>
        </nav>
      </div>

      {open && <button type="button" className="nav-scrim" aria-label="Close menu" onClick={closeMenu} />}
    </header>
  );
}
