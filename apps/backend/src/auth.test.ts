import request from 'supertest';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { config as loadEnv } from 'dotenv';
import { createApp } from './app';
import { prisma } from './db';

jest.setTimeout(30_000);

describe('Simple backend tests', () => {
  let agent: request.SuperAgentTest;

  beforeAll(async () => {
    const backendDir = path.resolve(__dirname, '..');
    if (!process.env.DATABASE_URL) {
      loadEnv({ path: path.join(backendDir, '.env.test') });
    }

    execSync(
      `npx prisma migrate deploy --schema ${path.join(backendDir, 'prisma', 'schema.prisma')}`,
      { cwd: backendDir, stdio: 'inherit', env: process.env }
    );

    await prisma.$connect();
    await prisma.$queryRawUnsafe('SELECT 1');

    await prisma.todo.deleteMany();
    await prisma.user.deleteMany();

    agent = request.agent(createApp());
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('registers and logs in', async () => {
    const reg = await agent
      .post('/api/auth/register')
      .send({ email: 'u@test.com', password: 'password123', name: 'User' });
    expect(reg.status).toBe(201);

    const login = await agent
      .post('/api/auth/login')
      .send({ email: 'u@test.com', password: 'password123' });
    expect(login.status).toBe(200);
  });

  it('creates and lists todos', async () => {
    const csrf = (await agent.get('/api/csrf')).body.csrfToken;

    await agent
      .post('/api/todos')
      .set('X-CSRF-Token', csrf)
      .send({ title: 'First Todo' })
      .expect(201);

    const list = await agent.get('/api/todos');
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body.items)).toBe(true);
    expect(list.body.items.length).toBe(1);
  });
});
