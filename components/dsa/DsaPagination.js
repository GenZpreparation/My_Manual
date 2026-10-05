"use client";

// Page numbers + Prev/Next. Beech me `...` sirf tab dikhta hai jab gap bada
// ho -- 1 ... 8 9 [10] 11 12 ... 45 -- isse 45 page ki list bhi ek line me
// fit ho jaati hai (mobile par bhi).
export default function DsaPagination({ page, totalPages, from, to, total, loading, onPage }) {
  if (totalPages <= 1) {
    return (
      <p className="dsa-page-summary">
        Showing all <strong>{total}</strong> problems
      </p>
    );
  }

  // Current page ke aas-paas ka window of page numbers
  const nums = [];
  const push = (n) => {
    if (!nums.includes(n) && n >= 1 && n <= totalPages) nums.push(n);
  };
  push(1);
  for (let i = page - 1; i <= page + 1; i++) push(i);
  push(totalPages);
  nums.sort((a, b) => a - b);

  // Non-adjacent numbers ke beech `...`
  const items = [];
  let prev = 0;
  for (const n of nums) {
    if (n - prev > 1) items.push({ gap: true, key: `gap-${prev}` });
    items.push({ n, key: `p-${n}` });
    prev = n;
  }

  const go = (n) => {
    if (n === page || n < 1 || n > totalPages) return;
    onPage(n);
  };

  return (
    <nav className="dsa-pagination" aria-label="DSA problems pages">
      <p className="dsa-page-summary">
        Showing <strong>{from}</strong>–<strong>{to}</strong> of <strong>{total}</strong> problems
      </p>

      <div className="dsa-page-controls">
        <button
          type="button"
          className="dsa-page-btn is-edge"
          onClick={() => go(page - 1)}
          disabled={page <= 1 || loading}
          aria-label="Previous page"
        >
          <span aria-hidden="true">←</span> Prev
        </button>

        <ul className="dsa-page-list">
          {items.map((it) =>
            it.gap ? (
              <li key={it.key} className="dsa-page-gap" aria-hidden="true">
                …
              </li>
            ) : (
              <li key={it.key}>
                <button
                  type="button"
                  className={"dsa-page-btn" + (it.n === page ? " is-active" : "")}
                  onClick={() => go(it.n)}
                  aria-label={"Page " + it.n}
                  aria-current={it.n === page ? "page" : undefined}
                >
                  {it.n}
                </button>
              </li>
            )
          )}
        </ul>

        <button
          type="button"
          className="dsa-page-btn is-edge"
          onClick={() => go(page + 1)}
          disabled={page >= totalPages || loading}
          aria-label="Next page"
        >
          Next <span aria-hidden="true">→</span>
        </button>
      </div>
    </nav>
  );
}