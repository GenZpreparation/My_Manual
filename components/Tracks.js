import Link from "next/link";

export default function Tracks({ tracks: tracksProp }) {
  const list = tracksProp || [];
  return (
    <section className="tracks" id="tracks">
      <div className="wrap">
        <div className="section-head reveal">
          <h2>
            Choose a <span className="gradient-text">track</span>
          </h2>
          <p>
            Every track opens into questions, model answers, and what
            interviewers usually listen for.
          </p>
        </div>

        <div className="track-grid">
          {list.map((track) =>
            track.comingSoon ? (
              <div
                className="track-card is-disabled reveal"
                key={track.index}
                aria-disabled="true"
              >
                <div className="track-card-top">
                  <span className="track-card-icon">
                    {track.icon || "📘"}
                  </span>
                  <span className="track-card-index">{track.index}</span>
                </div>
                <h3 className="track-card-name">{track.name}</h3>
                <p className="track-card-meta">{track.meta}</p>
                <span className="track-card-pill">Coming soon</span>
              </div>
            ) : (
              <Link className="track-card reveal" href={track.href} key={track.index}>
                <div className="track-card-top">
                  <span className="track-card-icon">
                    {track.icon || "📘"}
                  </span>
                  <span className="track-card-index">{track.index}</span>
                </div>
                <h3 className="track-card-name">{track.name}</h3>
                <p className="track-card-meta">{track.meta}</p>
                <span className="track-card-arrow">
                  Open track <span>→</span>
                </span>
              </Link>
            )
          )}
        </div>
      </div>
    </section>
  );
}
