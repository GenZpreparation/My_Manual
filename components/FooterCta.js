import Link from "next/link";

export default function FooterCta() {
  return (
    <section className="footer-cta">
      <div className="footer-cta-glow" aria-hidden="true" />
      <div className="footer-cta-inner reveal">
        <h2>Ready when you are — open a track, no sign up needed.</h2>
        <Link className="footer-cta-btn" href="/#tracks">
          Start practicing
          <span className="btn-arrow">→</span>
        </Link>
      </div>
    </section>
  );
}
