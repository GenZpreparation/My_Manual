# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# The Interview Manual -- production image
# 3 stages: deps (install) -> builder (next build) -> runner (chhota runtime)
# next.config.js me output:"standalone" hai, isliye runner me sirf self-contained
# server bundle jaata hai -- poore node_modules copy karne ki zaroorat nahi.
# ---------------------------------------------------------------------------

# ---------- 1. deps: sirf dependencies install (cache-friendly layer) ----------
FROM node:26-alpine AS deps
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# package.json ka `postinstall` -> `node patch-og.js` chalata hai, isliye ye file
# is layer me honi chahiye -- warna `npm ci` "MODULE_NOT_FOUND" se fail ho jaata
# hai (Linux par ye script kuch nahi karti, sirf "skipped" print karke exit 0).
COPY package.json package-lock.json patch-og.js ./
# BuildKit cache mount: npm ke packages image layer me store nahi hote (rebuild fast).
RUN --mount=type=cache,target=/root/.npm npm ci

# ---------- 2. builder: app build karta hai ----------
FROM node:26-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# public/ git me track nahi hai (khaali folder), isliye CI checkout me maujood
# nahi hota -- aur runner stage `COPY --from=builder /app/public` karta hai.
# Isliye folder yahin bana do, warna build "not found" se fail ho jaata hai.
RUN mkdir -p public
# Build-time public env vars (optional):
# ARG NEXT_PUBLIC_SITE_URL
# ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
RUN npm run build

# ---------- 3. runner: sirf production runtime, chhota final image ----------
FROM node:26-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# non-root user -- security best practice
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# .next/standalone me self-contained server.js + minimal node_modules hota hai
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# Container health: `/` par HTTP 200 mile (alpine me busybox wget hota hai)
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ >/dev/null 2>&1 || exit 1

CMD ["node", "server.js"]
