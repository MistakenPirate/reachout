FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# --- Prune the monorepo for the server app ---
FROM base AS pruner
WORKDIR /app
COPY . .
RUN pnpm dlx turbo prune server --docker

# --- Install dependencies & build ---
FROM base AS installer
WORKDIR /app

COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .
RUN pnpm turbo run build --filter=server

# --- Production runner ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile --prod

COPY --from=installer /app/apps/server/dist ./apps/server/dist
COPY --from=installer /app/packages/shared/dist ./packages/shared/dist
COPY --from=installer /app/packages/shared/package.json ./packages/shared/package.json

RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser
USER appuser

EXPOSE 4000

CMD ["node", "apps/server/dist/index.js"]
