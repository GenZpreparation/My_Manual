"use client";

import { memo } from "react";
import { DSA_CYCLE, DSA_DIFF_LABEL, DSA_STATUS_LABEL, DSA_STATUSES } from "@/lib/dsaShared";

// Ek problem ki row. Pura component memoized hai -- filter/sort change me
// 700 rows me se sirf badli hui rows hi re-render hoti hain (bina memo ke
// har keystroke pe 700 nodes paint hote).

// `rel="noopener noreferrer"` zaroori hai -- sab links new tab me khulte hai.
const LinkBtn = ({ href, className, children, title }) => (
  <a className={className} href={href} target="_blank" rel="noopener noreferrer" title={title}>
    {children}
  </a>
);

function DsaProblemRow({ problem, entry, onCycle, onStatus, onNotes, onAttempt, open, onToggle }) {
  const { id, title, difficulty, topic, subtopic, part, stars, serial, leetcode, gfg, search } = problem;
  const status = entry.status || "pending";
  const nextStatus = DSA_CYCLE[(DSA_CYCLE.indexOf(status) + 1) % DSA_CYCLE.length] || "in_progress";

  return (
    <li
      id={`dsa-${id}`}
      className={`dsa-row is-${difficulty} st-${status}${open ? " is-open" : ""}`}
      data-status={status}
    >
      <div className="dsa-row-head">
        {/* Checkbox jaisa status toggle: click = pending -> in progress -> solved */}
        <button
          type="button"
          className="dsa-check"
          onClick={() => onCycle(id, nextStatus)}
          aria-label={`Mark "${title}" as ${DSA_STATUS_LABEL[nextStatus]}`}
          title={`Status: ${DSA_STATUS_LABEL[status]} - click for ${DSA_STATUS_LABEL[nextStatus]}`}
        >
          <span className="dsa-check-mark" aria-hidden="true">
            {status === "solved" ? "✓" : status === "in_progress" ? "◐" : status === "doubt" ? "?" : ""}
          </span>
        </button>

        <div className="dsa-row-main">
          <h3 className="dsa-row-title">
            <button
              type="button"
              className="dsa-row-title-btn"
              onClick={() => onToggle(id)}
              aria-expanded={open}
              aria-controls={`dsa-panel-${id}`}
            >
              {title}
            </button>
          </h3>

          <div className="dsa-row-meta">
            <span className={`dsa-diff is-${difficulty}`}>{DSA_DIFF_LABEL[difficulty]}</span>
            {stars != null && (
              <span className="dsa-stars" title={`${stars} of 5 stars`}>
                {"★".repeat(stars)}
                <span className="dsa-stars-off">{"★".repeat(5 - stars)}</span>
              </span>
            )}
            <span className="dsa-row-topic">{topic}</span>
            {subtopic && <span className="dsa-row-sub">{subtopic}</span>}
            <span className={`dsa-row-part is-${part}`}>
              {part === "A" ? "Master Sheet" : "LearnYard"}
            </span>
            {serial != null && <span className="dsa-row-serial">#{serial}</span>}
          </div>
        </div>

        <div className="dsa-row-links">
          {leetcode ? (
            <LinkBtn href={leetcode} className="dsa-link-btn is-leetcode" title="Open on LeetCode">
              LeetCode <span aria-hidden="true">↗</span>
            </LinkBtn>
          ) : (
            <LinkBtn href={search} className="dsa-link-btn" title="Search this problem online">
              Search <span aria-hidden="true">↗</span>
            </LinkBtn>
          )}
          <LinkBtn href={gfg} className="dsa-link-btn" title="Find on GeeksforGeeks">
            GFG <span aria-hidden="true">↗</span>
          </LinkBtn>
        </div>

        <button
          type="button"
          className="dsa-row-expand"
          onClick={() => onToggle(id)}
          aria-expanded={open}
          aria-label={open ? "Hide notes" : "Show notes and attempts"}
        >
          <span aria-hidden="true">{open ? "−" : "+"}</span>
        </button>
      </div>

      {/* Expanded panel: status picker + attempts + personal notes */}
      <div className="dsa-row-panel" id={`dsa-panel-${id}`} hidden={!open}>
        <div className="dsa-panel-grid">
          <div className="dsa-panel-side">
            <span className="dsa-panel-label">Status</span>
            <div className="dsa-status-group" role="group" aria-label={`Status for ${title}`}>
              {DSA_STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`dsa-status-chip is-${s}${status === s ? " is-active" : ""}`}
                  onClick={() => onStatus(id, s)}
                  aria-pressed={status === s}
                >
                  {DSA_STATUS_LABEL[s]}
                </button>
              ))}
            </div>

            <span className="dsa-panel-label">Attempts</span>
            <div className="dsa-attempts">
              <button
                type="button"
                onClick={() => onAttempt(id, -1)}
                disabled={(entry.attempts || 0) <= 0}
                aria-label="Decrease attempts"
              >
                −
              </button>
              <span aria-live="polite">{entry.attempts || 0}</span>
              <button type="button" onClick={() => onAttempt(id, 1)} aria-label="Increase attempts">
                +
              </button>
            </div>

            <span className="dsa-panel-label">Practice links</span>
            <div className="dsa-panel-links">
              {leetcode && (
                <LinkBtn href={leetcode} className="dsa-link-btn is-leetcode">
                  LeetCode <span aria-hidden="true">↗</span>
                </LinkBtn>
              )}
              <LinkBtn href={gfg} className="dsa-link-btn">
                GeeksforGeeks <span aria-hidden="true">↗</span>
              </LinkBtn>
              <LinkBtn href={search} className="dsa-link-btn">
                Search web <span aria-hidden="true">↗</span>
              </LinkBtn>
            </div>
          </div>

          <div className="dsa-panel-notes">
            <label className="dsa-panel-label" htmlFor={`dsa-notes-${id}`}>
              Your notes
            </label>
            <textarea
              id={`dsa-notes-${id}`}
              className="dsa-notes"
              rows={4}
              placeholder="Approach, edge cases, link to your solution…"
              value={entry.notes || ""}
              onChange={(e) => onNotes(id, e.target.value)}
            />
          </div>
        </div>
      </div>
    </li>
  );
}

export default memo(DsaProblemRow);