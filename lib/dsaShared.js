// DSA page ke client components yahan se constants/labels lete hai.
// Ye file `fs` use nahi karti, isliye server ("use client" ke bina) aur
// browser dono me import ho sakti hai -- lib/dsa.js sirf server pe chalega.

export const DSA_STATUSES = ["pending", "in_progress", "solved", "doubt", "review", "skipped"];

export const DSA_STATUS_LABEL = {
  pending: "Pending",
  in_progress: "In progress",
  solved: "Solved",
  doubt: "Doubt",
  review: "Review",
  skipped: "Skipped",
};

// Ek click (status cycle button) par problem in hi states me ghoomti hai.
// `doubt`/`review`/`skipped` dropdown se lagate hain -- cycle rakhte rehne se
// "solved" ko ek click me kho dena mushkil ho jata.
export const DSA_CYCLE = ["pending", "in_progress", "solved"];

export const DSA_DIFFICULTIES = ["easy", "medium", "hard"];

export const DSA_DIFF_LABEL = { easy: "Easy", medium: "Medium", hard: "Hard" };

export const DSA_SORTS = [
  { id: "sheet", label: "Sheet order" },
  { id: "difficulty", label: "Easy first" },
  { id: "title", label: "A to Z" },
];

// localStorage key (browser me hi progress rehta hai -- no account, no server)
export const DSA_PROGRESS_KEY = "interview-manual-dsa-progress-v1";

export const DIFF_RANK = { easy: 0, medium: 1, hard: 2 };

export const emptyProgress = { status: "pending", notes: "", attempts: 0 };

export const readProgress = (id, map) => map?.[id] || emptyProgress;

export const sortDsaProblems = (list, mode) => {
  if (mode === "title") return [...list].sort((a, b) => a.title.localeCompare(b.title));
  if (mode === "difficulty") {
    return [...list].sort(
      (a, b) => (DIFF_RANK[a.difficulty] ?? 9) - (DIFF_RANK[b.difficulty] ?? 9) || a.n - b.n
    );
  }
  return [...list].sort((a, b) => a.n - b.n);
};