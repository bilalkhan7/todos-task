# todos-task

Nx monorepo containing:
- **apps/backend**: Express + TypeScript, Prisma (Postgres), Passport sessions, CSRF, Zod. Tests with **Jest + Supertest**.
- **apps/frontend**: Angular + **NgRx Component Store**, Jest unit tests for the store.

## Quick start

```bash
# 0) Postgres
docker compose up -d db

# 1) Install deps
corepack enable
npm install

# 2) Backend setup
cd apps/backend
cp .env.example .env
npm install
pnpm prisma:generate
pnpm prisma:migrate
cd ../../

# 3) Run
npm run start:backend   # http://localhost:4000
npm run start:frontend  # http://localhost:4200
```

## Tests
```bash
npm test
# or individually
npx nx test backend
npx nx test frontend
```
