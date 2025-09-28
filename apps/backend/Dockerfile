# ---------- base (install deps at repo root) ----------
FROM node:20-alpine AS base
WORKDIR /workspace

# Copy only lock + package manifests for efficient caching
COPY package*.json ./
# If you use npm workspaces, keep them in package.json at root
# Copy backend package manifest too (so npm can plan workspaces correctly)
COPY apps/backend/package*.json apps/backend/

RUN npm ci

# ---------- build backend ----------
FROM base AS build
WORKDIR /workspace

# Prisma schema & sources
COPY apps/backend/prisma apps/backend/prisma
# Copy the whole repo sources (TypeScript etc.)
COPY . .

# Generate Prisma client (required at build/runtime)
RUN npx prisma generate --schema=apps/backend/prisma/schema.prisma

# Build the backend (expects "build" script in apps/backend/package.json)
RUN npm run -w backend build

# ---------- runtime ----------
FROM node:20-alpine AS runtime
WORKDIR /workspace

# Copy node_modules from base (so @prisma/client & deps exist)
COPY --from=base /workspace/node_modules ./node_modules
# Copy built backend output
COPY --from=build /workspace/apps/backend/dist ./apps/backend/dist
# Copy prisma folder (migrations not needed for runtime, but ok)
COPY --from=build /workspace/apps/backend/prisma ./apps/backend/prisma

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node","/workspace/apps/backend/dist/index.js"]
