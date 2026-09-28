# The Interview Manual

**A free, no-login interview prep manual — organised the way a good study manual would be.**

Most interview-prep sites are either a wall of copy-pasted blog spam, a paywall that opens halfway
through topic three, or a 400-page PDF nobody ever finishes. This is the opposite: open any track,
pick a topic, read an answer that sounds like a person actually saying it out loud in an interview
room, and move on. No account, no email, no paywall — ever.

Built with Next.js 14 (App Router), fully responsive, Dockerized, and shipped with CI/CD.

---

## Purpose

The goal is dead simple: **make interview prep something you actually finish.**

That drove every decision in this project:

- **Answers written to be spoken, not skimmed.** Each model answer is structured the way you'd
  actually explain it — short answer first, then the reasoning, then code with real output, then the
  common mistakes and a tip. Read one, close the tab, reproduce it.
- **Topic by topic, not a dump.** Questions are grouped into modules, modules are grouped into
  tracks. Walk the syllabus in order, or jump straight to whatever you're weak at.
- **Zero friction to start.** No login. The moment the page loads you can read. Friction is where
  most prep plans quietly die.
- **Open by default.** Questions live in plain JSON in the repo. Add a module and the site, navbar,
  footer, sitemap and search index all update themselves. No CMS, no database, no admin panel.
- **Fast on a bad phone connection.** Most people will read this on mobile, often on mobile data.
  So: static generation, lazy-loaded modules, memoized rows, and motion that disables itself when
  the device can't afford it.

### Current content

| Track | Status |
|---|---|
| **Python** | 🟢 Live — 15 modules, 331 questions |
| Java | 🔜 Coming soon |
| JavaScript | 🔜 Coming soon |
| SQL | 🔜 Coming soon |
| Data Structures & Algorithms | 🔜 Coming soon |
| System Design | 🔜 Coming soon |

Counts are never hardcoded — the hero stats, track cards, footer and search index all read from
`data/`, so adding a module updates the entire site automatically.

---

## Features

### Reading & studying
- **Accordion Q&A** — click a question to expand its model answer, so you can scan a whole module
  before committing to reading one answer in depth.
- **Structured answers** — short answer, detailed explanation, key points, code examples with real
  output, common mistakes, real-world usage, and an interview tip, depending on what the question
  needs. Two answer schemas are supported side by side so older content never breaks.
- **Copy button on every code block** — one click to copy a snippet, with a "Copied" confirmation.
- **Wrap toggle** — long code lines scroll horizontally by default; on a phone you can flip to
  soft-wrap with one tap.
- **Instant search** — type two characters in the navbar and get matching questions across every
  track. The index is downloaded lazily on first focus, not on page load. Full keyboard support
  (`↑` `↓` `Enter` `Esc`). Clicking a result jumps straight to that question with it opened.
- **Every question is a real URL** — answers are server-rendered, so refreshing, sharing a link, or
  hitting Back all land you on exactly where you were.

### Interface
- **Light & dark theme** — follows your system preference by default, remembers your choice, and an
  inline script applies it *before* first paint so there's no white flash on a dark-mode load.
- **Sticky module navigation** — on desktop a sidebar highlights the active module and expands to
  show its topics. On mobile it becomes a chip rail that sticks under the navbar, so switching
  modules is always one thumb-reach away.
- **Mobile-first touch targets** — 44px minimum on interactive elements, safe-area padding for
  notched phones, and no blue Android tap-flash.
- **Motion with manners** — 3D card tilt, cursor spotlight, magnetic buttons, scroll progress bar.
  All rAF-throttled, and all of it switches itself off on touch devices, low-memory devices, and
  anyone with `prefers-reduced-motion` set.

### Performance
- **Static generation** — every track page is prerendered at build time.
- **Lazy module loading** — the first module ships with the page, the rest are fetched on hover/tap
  and cached. Opening a module feels instant without paying for 15 of them upfront.
- **Memoized question rows** — opening a question re-renders two rows instead of sixty.
- **`content-visibility`** — questions outside the viewport skip layout and paint entirely.
- **Stale-request guard** — rapidly clicking through modules can't leave the wrong content on screen.

### SEO
- Server-rendered answers, so they're crawlable without JavaScript.
- JSON-LD structured data: `WebSite`, `Organization`, `BreadcrumbList` and `ItemList`.
- Auto-generated `sitemap.xml` and `robots.txt`, per-page canonicals, Open Graph + Twitter cards,
  and generated OG images.
- Every module has its own crawlable URL (`/tracks/python/module_3`).

### Developer experience
- **Content is data, not code.** Drop a `module_N.json` into `data/<track>/` and the whole site —
  including search — updates itself. No component edits required. See `data/README.md`.
- **Dockerized** with a slim standalone image, or run it with `npm run dev`.
- **CI/CD on GitHub Actions** — lint + build on every push, Docker image to GitHub Container
  Registry, and an optional SSH auto-deploy to your own server.
- **No framework lock-in** — vanilla CSS with custom properties. No Tailwind, no CSS-in-JS, no
  component library, no heavy runtime dependencies.

### Tech stack
Next.js 14 (App Router) · React 18 · Three.js (hero scene) · vanilla CSS · `next/font`
(Inter + Space Grotesk + Newsreader, self-hosted at build time).

---

## Project structure
- `app/layout.js` — fonts, global metadata, theme init script
- `app/page.js` — assembles the landing page sections
- `app/tracks/[slug]/[module]/page.js` — per-track, per-module question pages
- `app/globals.css` — all styling: custom properties/theming, layout, and a dedicated **RESPONSIVE / MOBILE** section at the bottom with breakpoints for tablet/phone
- `components/` — `Navbar` (desktop nav + mobile hamburger menu), `NavSearch`, `Hero`, `HeroScene`, `Tracks`, `Why`, `FooterCta`, `Footer`, `ThemeToggle`, `ScrollReveal`, `Motion3D`
- `components/track/` — `TrackView` (lazy loading + URL sync), `TrackSidebar`, `QuestionList`, `CodeBlock`
- `lib/` — `tracks.js` (data loading), `renderAnswer.js` (dependency-free markdown-ish answer renderer), `data.js` (landing copy), `site.js` (site config)
- `app/api/` — `search` (question index) and `tracks/[slug]/[id]` (lazy module fetch)
- `data/<track>/*.json` — actual question content per track/module (see `data/README.md`)

## Responsive design
- Removed the old hard `min-width: 1100px` (desktop-only) constraint on `body`.
- Navbar collapses into a hamburger button with a slide-down mobile menu (accordion "Tracks" list, search, CTA) below ~900px.
- Hero, track grid, "Why" grid, footer, and the track sidebar/content layout all reflow and stack at tablet (≤860px) and phone (≤640px) breakpoints.
- The track sidebar becomes a horizontally-scrollable chip bar on small screens instead of a fixed sticky column.
- 3D hero scene / cursor-tilt effects already skip themselves on touch devices, low-memory devices, and `prefers-reduced-motion`.

## UI/UX + performance work (track/Q&A page)
Interview content (`data/**/*.json`) is **untouched** by all of this — changes are only in components and `app/globals.css`.

**Mobile**
- The module chip rail is now **sticky under the navbar** (≤860px), so switching modules stays one thumb-reach away while scrolling. Chips get 44px min touch targets, 14.5px text and scroll-snap.
- The active module chip auto-centers itself in the rail (on load, refresh, or search jump), computed manually via `scrollLeft` so it never jerks the page vertically.
- Question rows get 56px min height, 15px question text, and `align-items:center` so the `+`/`−` sits on the vertical center.
- Code blocks drop to 12.5px with 14px padding, and the Copy/Wrap buttons grow to 34px.
- `text-size-adjust:100%` stops iOS Safari from inflating fonts in landscape; `env(safe-area-inset-*)` padding for notched phones; `-webkit-tap-highlight-color:transparent` removes the blue Android tap flash.

**Reading UX**
- **Copy** button on every code block (clipboard API + `execCommand` fallback for non-secure contexts) with a "Copied" confirmation.
- **Wrap** toggle for long code lines — the default is horizontal scroll, but on a phone soft-wrap is one tap away.
- Horizontal-scroll edge shadows on code blocks so it's obvious more lines exist.
- Tables are wrapped in a scroll container (`.qa-table-wrap`) — previously a wide table pushed the whole page sideways.
- "Module 3 of 15" breadcrumb above each module heading.
- Long URLs/paths no longer overflow the answer box (`overflow-wrap:break-word`).

**Performance**
- Each question row is a `memo`-ized component, so opening/closing one question re-renders 2 rows instead of all 60.
- `content-visibility:auto` + `contain-intrinsic-size` on `.qa-item` skips layout/paint for questions outside the viewport (disabled under `prefers-reduced-motion`).
- Mobile module rail uses `overscroll-behavior-x:contain` so swiping chips doesn't scroll the page.

**Accessibility**
- `aria-controls`/`aria-expanded` wired to the answer panel; `role="status"` + `aria-live="polite"` announces module/question load state.
- Only *actually scrollable* code blocks become keyboard-focusable (measured with `ResizeObserver`) — otherwise a page would have 50+ useless tab stops.
- Focus-visible outline on code blocks, and all animations respect `prefers-reduced-motion`.

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000

## Deploy to Vercel (recommended for this project)

This is a static Next.js app, so Vercel is the easiest target — no server to maintain, and every
module page is prerendered at build time.

### Option A — connect the GitHub repo (recommended)
1. Go to [vercel.com/new](https://vercel.com/new) and sign in with GitHub.
2. Import **`GenZpreparation/My_Manual`**. Vercel auto-detects Next.js — leave **Framework Preset**,
   **Build Command** (`npm run build`) and **Output Directory** at their defaults.
3. Add the environment variable (below).
4. Click **Deploy**. Every future push to `main` redeploys automatically.

### Option B — from the terminal
```bash
npm i -g vercel
vercel          # first run: login + link to a project
vercel --prod   # production deploy
```

### Environment variable (important in production)
Set this under **Vercel → Project → Settings → Environment Variables → Add**, for Production,
Preview and Development:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain.com` (or `https://<project>.vercel.app` until you attach a custom domain) |

Without it `lib/site.js` falls back to `http://localhost:3000`, so canonical URLs, `sitemap.xml` and
OG tags all point at localhost — bad for SEO and for social previews.

> Add a custom domain later? Update this variable to the custom domain too, otherwise the canonical
> tags and the sitemap will disagree with each other in search results.

### Already handled for Vercel
- `next.config.js` detects `VERCEL=1` and **disables `output: "standalone"`** — that output is only
  needed for the Docker image, and Vercel uses its own runtime.
- `patch-og.js` **skips itself on non-Windows**, so the Windows-only `@vercel/og` font/wasm fix never
  runs on Vercel and can't break the install step.
- `.dockerignore` keeps Docker-only files out of the uploaded source.
- A blocking inline script sets `data-theme` before first paint, so there's no white flash on a
  dark-mode load.


## Build
```bash
npm run build
npm start
```

## Run with Docker
```bash
# build & run
docker compose up --build

# or plain docker
docker build -t interview-manual .
docker run -p 3000:3000 interview-manual
```
`next.config.js` uses `output: "standalone"` so the production image only ships the minimal server + required `node_modules`.

## Environment variables
Copy `.env.example` to `.env.local` and fill in as needed:
```bash
cp .env.example .env.local
```
| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL used for SEO/sitemap/OG tags |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Google Search Console verification (optional) |

## CI/CD (GitHub Actions)
- **`.github/workflows/ci.yml`** — runs on every push/PR to `main`: install → `npm run lint` → `npm run build`.
- **`.github/workflows/deploy.yml`** — on push to `main` (or a `v*` tag): builds the Docker image and pushes it to **GitHub Container Registry** (`ghcr.io/<owner>/<repo>`), then (optionally) SSHes into your server and redeploys the container.

### Enabling auto-deploy to your own server
The deploy job is **off by default** so CI stays green even without a server. To turn it on:
1. In your repo → **Settings → Secrets and variables → Actions → Variables**, add `ENABLE_DEPLOY = true`.
2. Under **Secrets**, add:
   - `DEPLOY_HOST` — server IP/domain
   - `DEPLOY_USER` — SSH user
   - `DEPLOY_SSH_KEY` — private key with access to that server (public key added to the server's `authorized_keys`)
   - `DEPLOY_PORT` — SSH port (optional, defaults to 22)
   - `NEXT_PUBLIC_SITE_URL` — used as a container env var on deploy
3. Make sure Docker is installed on the target server and that `DEPLOY_USER` can run `docker` commands.
4. Push to `main` — the workflow builds, pushes to GHCR, then pulls + restarts the container on your server.

If you deploy elsewhere (Vercel, Railway, Render, a Kubernetes cluster, etc.) instead of a bare VPS, swap the `deploy` job in `deploy.yml` for that platform's CLI/action — the Docker image itself (`ghcr.io/<owner>/<repo>:main`) works anywhere that can pull a container image.

## GitHub project setup included
- `.github/workflows/` — CI + Docker build/push + deploy
- `.github/ISSUE_TEMPLATE/` — bug report & feature request templates
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/dependabot.yml` — weekly dependency update PRs (npm, Docker, GitHub Actions)
- `CONTRIBUTING.md`, `LICENSE` (MIT — swap if you want something else)

## Notes for backend integration (later)
- Track list, dropdown menu items, and hero stats come from `lib/tracks.js` / `data/*` — replace with a real API when ready.
- The navbar search lazily loads a question index from `/api/search`.
- A database-backed `/api/tracks/[slug]/[id]` would let students contribute questions without a PR.

---

## Roadmap
- [x] Python track — 15 modules, 331 questions
- [ ] Fill in the remaining five tracks (Java, JavaScript, SQL, DSA, System Design)
- [ ] **Progress tracking** — mark questions as "practised" / "confident" and see your weak areas
- [ ] **Flashcards mode** — question on the front, answer on the back, for active recall drilling
- [ ] Mock-interview mode — a random cross-module question picker with a timer
- [ ] Bookmark or share a single question as a short link
- [ ] Dark-mode-aware syntax highlighting for code blocks

Contributions are very welcome — especially new questions. See `data/README.md` for the JSON
format; adding content requires zero code changes.

---

## Contributing
Issues and PRs are open. If you're adding questions, the only rule is: keep the answer structure
consistent with the existing modules and write it the way you'd say it out loud.

```bash
git clone https://github.com/GenZpreparation/My_Manual.git
cd My_Manual
npm install
npm run dev
```

See `CONTRIBUTING.md` for the full guidelines and `.github/PULL_REQUEST_TEMPLATE.md` for the PR
checklist.

## License
MIT — see [`LICENSE`](LICENSE). Swap it if you'd rather.

## Acknowledgements
Built with Next.js, React and Three.js. Fonts (Inter, Space Grotesk, Newsreader) are open source and
self-hosted at build time via `next/font`.
