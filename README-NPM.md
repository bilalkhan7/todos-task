
# Using npm with todos-task Nx monorepo

## Install
```bash
npm install
```

## Backend (Prisma init)
```bash
cd apps/backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
cd ../../
```

## Run
```bash
npm run start:backend   # http://localhost:4000
npm run start:frontend  # http://localhost:4200
```

## Tests
```bash
npm test                # runs Nx test target for all
npx nx test backend     # backend only
npx nx test frontend    # frontend only
```
