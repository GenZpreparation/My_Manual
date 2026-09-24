# Contributing

Thanks for helping improve **The Interview Manual**! 🙌

## Local setup
```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
npm install
npm run dev
```
Open http://localhost:3000

## Branch & PR flow
1. Fork/branch from `main`: `git checkout -b feature/my-change`
2. Make your changes, keep commits focused.
3. `npm run lint` and `npm run build` should both pass locally.
4. Open a PR against `main` using the PR template — CI (`.github/workflows/ci.yml`) will lint + build automatically.

## Adding/editing questions
Track content lives under `data/<track>/*.json`. See `data/README.md` and `data/_template/` for the expected shape of a track/module file.

## Code style
- Plain CSS in `app/globals.css` (custom properties for theming — don't hardcode colors).
- Keep components server components by default; add `"use client"` only when you need state/effects/browser APIs.

## Reporting issues
Use the Bug report / Feature request templates under **Issues → New issue**.
