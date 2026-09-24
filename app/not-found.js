import Link from "next/link";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="wrap" style={{ padding: "120px 32px", textAlign: "center" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 48 }}>404 — page not found</h1>
      <p style={{ margin: "16px 0 28px", color: "var(--ink-soft)" }}>
        Ye page exist nahi karta ya ab hata diya gaya hai.
      </p>
      <Link className="btn-primary" href="/">Back to home</Link>
    </main>
  );
}
