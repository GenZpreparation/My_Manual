import { whyItems } from "@/lib/data";

const whyIcons = ["💬", "🔓", "🔄"];

export default function Why() {
  return (
    <section className="why" id="why">
      <div className="wrap">
        <div className="section-head reveal">
          <h2>
            Why students <span className="gradient-text">stick</span> with it
          </h2>
          <p></p>
        </div>

        <div className="why-grid">
          {whyItems.map((item, i) => (
            <div className="why-item reveal" key={item.title}>
              <span className="why-icon">{whyIcons[i % whyIcons.length]}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
