import { getTracks } from "@/lib/tracks";
import HeroScene from "@/components/HeroScene";

export default function Hero() {
  // Stats data/ folder se REAL me nikalte hai -- naya language/module add karte hi badal jaate hai
  const live = getTracks().filter((t) => !t.comingSoon);
  const totalQuestions = live.reduce((sum, t) => sum + t.totalCount, 0);
  const heroStats = [
    { num: String(live.length), label: live.length === 1 ? "Track compiled" : "Tracks compiled" },
    { num: totalQuestions.toLocaleString("en-IN"), label: "Questions inside" },
    { num: "0", label: "Cost, ever" },
  ];

  return (
    <section className="hero">
      <HeroScene />
      <div className="hero-glow hero-glow-a" aria-hidden="true" />
      <div className="hero-glow hero-glow-b" aria-hidden="true" />

      <div className="wrap hero-inner">
        <div className="hero-copy reveal in-view">
          <span className="hero-badge">
            <span className="hero-badge-dot" />
            built for students, not recruiters
          </span>

          <h1>
            Practice the questions
            <br />
            <span className="gradient-text">real interviews</span> actually
            ask.
          </h1>

          <p className="hero-sub">
            Java, Python, SQL and more — organised the way a good study
            manual would be. One topic at a time, plain explanations,
            absolutely nothing to sign up for.
          </p>

          <div className="hero-actions">
            <a className="btn-primary" href="#tracks">
              Open the manual
              <span className="btn-arrow">→</span>
            </a>
            <a className="btn-ghost" href="#why">
              Why it&apos;s different
            </a>
          </div>
        </div>

        <div className="hero-panel reveal">
          {heroStats.map((stat) => (
            <div className="panel-row" key={stat.label}>
              <span className="panel-num">{stat.num}</span>
              <span className="panel-label">{stat.label}</span>
            </div>
          ))}
          <div className="panel-glow" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
