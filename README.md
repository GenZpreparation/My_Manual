# The Interview Manual — Frontend (Next.js)

Free, no-login interview-question manual (Java, Python, SQL, DSA, JavaScript, System Design...) built with Next.js 14 (App Router). Fully responsive (mobile → desktop), Dockerized, with CI/CD via GitHub Actions.

## Structure
- `app/layout.js` — fonts (Newsreader + Inter + Space Grotesk via `next/font`) and metadata
- `app/page.js` — assembles the landing page sections
- `app/tracks/[slug]/[module]/page.js` — per-track, per-module question pages
- `app/globals.css` — all styling: custom properties/theming, layout, and a dedicated **RESPONSIVE / MOBILE** section at the bottom with breakpoints for tablet/phone
- `components/` — `Navbar` (desktop nav + mobile hamburger menu), `Hero`, `Tracks`, `Why`, `FooterCta`, `Footer`, `track/*`
- `lib/` — track/question data helpers
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
