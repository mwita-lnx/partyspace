# ── Stage 1: Builder ──────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps first (layer cache)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
# Set dummy values for build - real values will be provided at runtime
ENV MONGODB_URI=mongodb://localhost:27017/partyspace
ENV JWT_SECRET=dummy_build_secret
ENV NEXTAUTH_SECRET=dummy_build_secret

RUN npm run build

# ── Stage 2: Runner ───────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Only copy what's needed to run
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
