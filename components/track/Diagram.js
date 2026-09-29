"use client";

import { useId, useState } from "react";

// ---------------------------------------------------------------------------
// Diagram engine -- dependency-free, purely declarative.
//
// Answers ke JSON me sirf DATA hota hai (nodes/columns/rows), aur ye file us
// data ko HTML banati hai. Isse:
//   * koi nayi library nahi (Mermaid ~1MB hota, client par render hota)
//   * text asli <button>/<div> hai, isliye wrap + screen-reader dono theek
//   * theme CSS variables se aata hai, light/dark dono me fit ho jaata hai
//   * diagram JSON padhne wala ko HTML/CSS nahi pata hona chahiye
//
// Har diagram ka `type` alag renderer chunta hai:
//   flow    -> vertical flowchart, connectors + branches + clickable "why?"
//   compare -> 2-3 side-by-side cards (list vs tuple etc.)
//   matrix  -> styled decision table
//   refs    -> variable -> object ka reference map (shared-state diagrams)
//
// `tone` har renderer me same values leti hai:
//   neutral (default) | strong (solid ink) | soft (dashed) | warn
// ---------------------------------------------------------------------------

/* Har diagram ke aarah-paash ka common frame: title, body, caption.
   NOTE: figure ko `dg-${kind}` class NAHI dena chahiye -- renderer ke andar
   usi naam ka body element (jaise `<div className="dg-compare">`) hota hai.
   Warna figure khud grid/flex ban jaata tha aur content ek hi track me squeeze
   ho jaata tha. Isliye frame ke liye alag `dg-frame-${kind}` prefix hai. */
function Frame({ kind, title, caption, children }) {
  return (
    <figure className={`dg dg-frame dg-frame-${kind}`}>
      {title && <figcaption className="dg-title">{title}</figcaption>}
      {children}
      {caption && <p className="dg-caption">{caption}</p>}
    </figure>
  );
}

/* flow nodes ke saath ek chhota "kyun?" toggle -- answer ko interactive banata
   hai bina kisi heavy library ke. Button + aria-expanded, keyboard bhi chalega. */
function Note({ children, label = "Why?" }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <div className="dg-note">
      <button
        type="button"
        className="dg-note-btn"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
      >
        {label}
      </button>
      <div id={id} className="dg-note-body" hidden={!open}>
        {children}
      </div>
    </div>
  );
}

/* --- flow: vertical flowchart ------------------------------------------- */

function FlowDiagram({ title, caption, steps = [], noteLabel = "Why?" }) {
  return (
    <Frame kind="flow" title={title} caption={caption}>
      <ol className="dg-flow">
        {steps.map((s, i) => (
          <li className="dg-flow-step" key={i}>
            {/* is node se upar wale node ke beech ka arrow + uska label */}
            {i > 0 && (
              <div className="dg-arrow" aria-hidden="true">
                <span className="dg-arrow-line" />
                <span className="dg-arrow-head" />
                {s.from && <span className="dg-arrow-label">{s.from}</span>}
              </div>
            )}

            <div className={`dg-node dg-tone-${s.tone || "neutral"}`}>
              <span className="dg-node-label">{s.label}</span>
              {s.sub && <span className="dg-node-sub">{s.sub}</span>}
              {s.note && <Note label={noteLabel}>{s.note}</Note>}
            </div>

            {/* ek node se 2 raste -- CSS se banaya "fork", koi SVG nahi */}
            {Array.isArray(s.branches) && s.branches.length > 0 && (
              <>
                <div className="dg-fork" aria-hidden="true">
                  <span className="dg-fork-stem" />
                  <span className="dg-fork-bar" />
                </div>
                <div className="dg-branches">
                  {s.branches.map((b, bi) => (
                    <div className={`dg-branch dg-tone-${b.tone || "soft"}`} key={bi}>
                      <span className="dg-branch-label">{b.label}</span>
                      {b.sub && <span className="dg-branch-sub">{b.sub}</span>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </li>
        ))}
      </ol>
    </Frame>
  );
}

/* --- compare: side-by-side cards ---------------------------------------- */

function CompareDiagram({ title, caption, columns = [] }) {
  return (
    <Frame kind="compare" title={title} caption={caption}>
      <div
        className="dg-compare"
        style={{ "--dg-cols": Math.min(Math.max(columns.length, 1), 3) }}
      >
        {columns.map((c, i) => (
          <div className={`dg-col dg-tone-${c.tone || "neutral"}`} key={i}>
            <div className="dg-col-head">
              <span className="dg-col-title">{c.title}</span>
              {c.sub && <span className="dg-col-sub">{c.sub}</span>}
            </div>
            {c.rows &&
              c.rows.map((r, ri) => (
                <div className="dg-col-row" key={ri}>
                  <span className="dg-row-label">{r.label}</span>
                  <span className={`dg-row-value dg-tv-${r.tone || "plain"}`}>{r.value}</span>
                </div>
              ))}
          </div>
        ))}
      </div>
    </Frame>
  );
}

/* --- matrix: decision table --------------------------------------------- */

function MatrixDiagram({ title, caption, head = [], rows = [], footer, emphasis = -1 }) {
  return (
    <Frame kind="matrix" title={title} caption={caption}>
      {/* phone par table scroll hoti hai, page nahi -- .qa-table-wrap jaisa hi */}
      <div className="dg-table-wrap">
        <table className="dg-table">
          <thead>
            <tr>
              {head.map((h, i) => (
                <th key={i} className={i === emphasis ? "is-emphasis" : ""}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri}>
                {r.map((c, ci) => (
                  <td
                    key={ci}
                    className={
                      ci === 0 ? "is-key" : ci === emphasis ? "is-emphasis" : undefined
                    }
                  >
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {footer && (
            <tfoot>
              <tr>
                {footer.map((c, i) => (
                  <td
                    key={i}
                    className={i === 0 ? "is-key" : i === emphasis ? "is-emphasis" : undefined}
                  >
                    {c}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </Frame>
  );
}

/* --- refs: variable -> object reference map ------------------------------ */
/* Mutable vs immutable ka asli reason sirf tab samajh aata hai jab dikhaye ki
   do names ek hi object par kaise tik jaate hain. `states` se before/after
   toggle hota hai, isliye reader khud change apply karke dekh sakta hai. */

function RefsDiagram({ title, caption, states = [] }) {
  const [active, setActive] = useState(0);
  const cur = states[active] || { rows: [] };

  return (
    <Frame kind="refs" title={title} caption={caption}>
      {states.length > 1 && (
        <div className="dg-tabs" role="tablist" aria-label={title || "Object state"}>
          {states.map((s, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === active}
              className={`dg-tab${i === active ? " is-active" : ""}`}
              onClick={() => setActive(i)}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      <div className="dg-refs">
        {(cur.rows || []).map((r, i) => (
          <div className={`dg-ref${r.shared ? " is-shared" : ""}`} key={i}>
            <span className="dg-ref-name">{r.name}</span>
            <span className="dg-ref-arrow" aria-hidden="true">
              →
            </span>
            <span className={`dg-ref-obj dg-tone-${r.tone || "neutral"}`}>
              <span className="dg-ref-type">{r.type}</span>
              <span className="dg-ref-value">{r.value}</span>
            </span>
            {r.badge && <span className="dg-ref-badge">{r.badge}</span>}
          </div>
        ))}
      </div>

      {cur.note && <p className="dg-note-line">{cur.note}</p>}
    </Frame>
  );
}

const TYPES = {
  flow: FlowDiagram,
  compare: CompareDiagram,
  matrix: MatrixDiagram,
  refs: RefsDiagram,
};

export default function Diagram({ diagram }) {
  if (!diagram || !diagram.type) return null;
  const Renderer = TYPES[diagram.type];
  if (!Renderer) return null;
  // JSX se render karte hain (direct function call nahi) taaki hooks sahi se chalein
  return <Renderer {...diagram} />;
}
