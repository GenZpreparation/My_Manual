import Link from "next/link";

export const metadata = {
  title: "You're offline",
  robots: { index: false, follow: false },
};

// Service worker is page ko tabhi serve karta hai jab network na ho
// (public/sw.js -> "/offline"). Isliye styling light rakhi hai taaki
// cached HTML sahi dikhe -- koi bhi dynamic data fetch na kare.
export default function OfflinePage() {
  return (
    <main
      className="wrap"
      style={{ padding: "110px 32px 140px", textAlign: "center", minHeight: "100vh" }}
    >
      <span
        className="logo-mark"
        style={{ width: 44, height: 44, fontSize: 21, margin: "0 auto 26px" }}
        aria-hidden="true"
      >
        M
      </span>

      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, letterSpacing: "-0.02em" }}>
        You&rsquo;re offline
      </h1>

      <p
        style={{
          margin: "14px auto 30px",
          color: "var(--ink-soft)",
          fontSize: 15.5,
          lineHeight: 1.7,
          maxWidth: "46ch",
        }}
      >
        This page needs the internet and it couldn&rsquo;t be reached. Pages you&rsquo;ve
        already opened still work offline.
      </p>

      <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
        <Link className="btn-primary" href="/">
          Try again
        </Link>
        <Link className="btn-ghost" href="/dsa">
          Open DSA sheet
        </Link>
      </div>
    </main>
  );
}
