// Production me .env.local / hosting dashboard me NEXT_PUBLIC_SITE_URL=https://apna-domain.com set karo.
// Sitemap, canonical, Open Graph sab isi URL se bante hai.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
export const SITE_NAME = "The Interview Manual";
export const DEFAULT_TITLE = "The Interview Manual — Free Interview Questions & Answers";
