"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "interview-manual-theme"; // localStorage me isi naam se save hota hai

export default function ThemeToggle() {
  // layout.js ka inline script <html> pe data-theme already laga chuka
  // hota hai load hone se pehle (taaki flash na dikhe) -- yahan hum bas
  // usko padh ke apne button ka icon sahi dikha dete hai.
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    setTheme(document.documentElement.getAttribute("data-theme") || "light");
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  // Pehle render pe theme pata nahi hota (client-only), tab tak neutral
  // icon dikhao taaki server/client HTML match ho aur React warning na aaye
  if (theme === null) {
    return <button type="button" className="theme-toggle" aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      title={theme === "dark" ? "Light theme" : "Dark theme"}
    >
      {theme === "dark" ? (
        // Sun icon (dark mode me hai, light pe switch karne ka option dikhao)
        <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1.5" />
          <path
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            d="M10 1.5v2M10 16.5v2M18.5 10h-2M3.5 10h-2M15.6 4.4l-1.4 1.4M5.8 14.2l-1.4 1.4M15.6 15.6l-1.4-1.4M5.8 5.8L4.4 4.4"
          />
        </svg>
      ) : (
        // Moon icon (light mode me hai, dark pe switch karne ka option dikhao)
        <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M17 11.5A7.5 7.5 0 018.5 3a7.5 7.5 0 108.5 8.5z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
