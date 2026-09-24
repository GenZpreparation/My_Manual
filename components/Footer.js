import Link from "next/link";
import { getTracks } from "@/lib/tracks";

export default function Footer() {
  const footerTracks = getTracks().filter((t) => t.name !== "System Design");

  return (
    <footer>
      <div className="footer-main">
        <div className="footer-brand">
          <Link href="/" className="brand">
            <span className="logo-mark">M</span>
            <span className="brand-text">The Interview Manual</span>
          </Link>
          <p>
            A free, no-login collection of interview questions for students
            preparing across languages and core CS topics.
          </p>
        </div>

        <div className="footer-col">
          <h4>Tracks</h4>
          <ul>
            {footerTracks.map((track) => (
              <li key={track.name}>
                <Link href={track.href || "/#tracks"}>{track.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>Explore</h4>
          <ul>
            <li>
              <Link href="/#why">Why this</Link>
            </li>
            <li>
              <Link href="/#tracks">All tracks</Link>
            </li>
            <li>
              <span className="footer-soon" title="Coming soon">Newly added questions</span>
            </li>
            <li>
              <span className="footer-soon" title="Coming soon">Suggest a question</span>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Manual</h4>
          <ul>
            <li>
              <span className="footer-soon" title="Coming soon">About</span>
            </li>
            <li>
              <span className="footer-soon" title="Coming soon">Contact</span>
            </li>
            <li>
              <span className="footer-soon" title="Coming soon">Privacy</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <span>© 2026 The Interview Manual. Free, and staying that way.</span>
          <div className="footer-bottom-links">
            <span className="footer-soon" title="Coming soon">Privacy</span>
            <span className="footer-soon" title="Coming soon">Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
