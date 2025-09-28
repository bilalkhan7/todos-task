import { execSync } from 'node:child_process';
import path from 'node:path';
import { config as loadEnv } from 'dotenv';

export default async function globalSetup() {
  const backendDir = path.resolve(__dirname, '..');

  loadEnv({ path: path.join(backendDir, '.env.test') });
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not set from .env.test');
  }

  execSync(
    `npx prisma migrate deploy --schema ${path.join(backendDir, 'prisma', 'schema.prisma')}`,
    { cwd: backendDir, stdio: 'inherit', env: process.env }
  );
}
