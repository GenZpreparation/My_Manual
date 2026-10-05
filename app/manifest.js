import { SITE_NAME } from "@/lib/site";

// Web App Manifest -- yahi file browser ko batata hai ki site ko phone ke home
// screen par "install" kaise karna hai. Next ise /manifest.webmanifest par
// serve karta hai aur <head> me link tag khud inject kar deta hai.
//
// PWA install hone ke liye teen cheezein zaroori hain:
//   1. manifest with name + icons (192 & 512) + start_url + display
//   2. HTTPS (Vercel pe free hai)
//   3. ek service worker (offline + install prompt)
//
// ⚠️ ICONS RELATIVE PATH ME RAKHE HAIN (SITE_URL nahi use karte)
// Agar absolute URL dete (`${SITE_URL}/icons/...`) to NEXT_PUBLIC_SITE_URL set
// na hone par wo `http://localhost:3000/...` ban jata tha -- aur browser
// localhost se icon load hi nahi kar pata, jisse install FAIL ho jata.
// Relative path har domain par khud resolve ho jata hai (vercel.app bhi,
// apna custom domain bhi), isliye domain na lene par bhi kaam karega.
const icon = (name, size, purpose) => ({
  src: `/icons/${name}`,
  sizes: `${size}x${size}`,
  type: "image/png",
  purpose,
});

export default function manifest() {
  return {
    name: `${SITE_NAME} — Interview Questions & DSA`,
    short_name: "Interview Manual",
    description:
      "Free interview questions with model answers, plus 718 curated DSA problems with practice links. No sign up, works offline.",
    lang: "en-IN",
    dir: "ltr",

    start_url: "/?utm_source=pwa",
    scope: "/",
    id: "/",

    // Standalone = browser ka address bar hat jata hai, app jaisa fullscreen
    // khulta hai (bilkul wahi jo user maang raha hai).
    display: "standalone",
    display_override: ["standalone", "minimal-ui", "browser"],

    background_color: "#FAF7F0",
    theme_color: "#1C1812",

    categories: ["education", "books", "productivity"],

    icons: [
      icon("icon-192.png", 192, "any"),
      icon("icon-512.png", 512, "any"),
      // Maskable: Android apna shape kaat-ta hai, isliye alag se dete hain
      icon("icon-maskable-192.png", 192, "maskable"),
      icon("icon-maskable-512.png", 512, "maskable"),
    ],

    // Home screen icon ko lamba press karne par shortcut (Android/Chrome)
    shortcuts: [
      {
        name: "DSA Questions",
        short_name: "DSA",
        description: "718 DSA problems, easy to hard",
        url: "/dsa?utm_source=pwa",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Python Interview Questions",
        short_name: "Python",
        description: "Python interview questions and answers",
        url: "/tracks/python?utm_source=pwa",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
