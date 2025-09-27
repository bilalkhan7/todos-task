import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import bcrypt from 'bcryptjs';
import pg from 'pg';
import connectPg from 'connect-pg-simple';

import { env } from './env';
import { prisma } from './db';
import { passport } from './auth';
import { RegisterSchema, LoginSchema, TodoCreateSchema, TodoUpdateSchema } from './schemas';
import { requireAuth } from './middleware';

export function createApp() {
  const app = express();

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
      allowedHeaders: ['Content-Type', 'X-CSRF-Token', 'X-XSRF-TOKEN'],
    })
  );

  const pgPool = new pg.Pool({ connectionString: env.databaseUrl });
  const PgStore = connectPg(session);

  app.use(
    session({
      store: new PgStore({
        pool: pgPool,
        tableName: 'user_sessions', 
        createTableIfMissing: true, 
      }),
      secret: env.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',                
        secure: false,                 
        maxAge: 1000 * 60 * 60 * 24,
      },
      name: 'sid',
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  const csrfProtection = csrf({ cookie: true });

  app.use((req: Request, _res: Response, next: NextFunction) => {
    const xsrf = req.headers['x-xsrf-token'];
    if (xsrf && !req.headers['x-csrf-token'] && !req.headers['csrf-token']) {
      req.headers['x-csrf-token'] = Array.isArray(xsrf) ? xsrf[0] : xsrf;
    }
    next();
  });

  app.get('/api/csrf', csrfProtection, (req: Request, res: Response) => {
    const token = req.csrfToken();
    res.cookie('XSRF-TOKEN', token, {
      httpOnly: false,
      sameSite: 'lax',
      secure: false,
    });
    res.json({ csrfToken: token });
  });

  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  app.post('/api/auth/register', async (req, res) => {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });

    const email = parsed.data.email.toLowerCase(); 

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash, name: parsed.data.name },
    });

    res.status(201).json({ user: { id: user.id, email: user.email, name: user.name } });
  });

  app.post(
    '/api/auth/login',
    (req, res, next) => {
      const parsed = LoginSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
      (req as any).body = { email: parsed.data.email.toLowerCase(), password: parsed.data.password };
      next();
    },
    passport.authenticate('local'),
    (req, res) => {
      res.json({ user: req.user });
    }
  );

  app.post('/api/auth/logout', csrfProtection, (req, res) => {
    req.logout(err => {
      if (err) return res.status(500).json({ message: 'Logout error' });
      req.session.destroy(() => res.status(204).end());
    });
  });

  app.get('/api/auth/me', (req, res) => {
    if (req.isAuthenticated && req.isAuthenticated()) return res.json(req.user);
    return res.status(401).json({ message: 'Unauthorized' });
  });

  app.get('/api/todos', requireAuth, async (req, res) => {
    const userId = (req.user as any).id as string;
    const items = await prisma.todo.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    const total = await prisma.todo.count({ where: { userId } });
    res.json({ items, total });
  });

  app.get('/api/todos/:id', requireAuth, async (req, res) => {
    const userId = (req.user as any).id as string;
    const item = await prisma.todo.findFirst({
      where: { id: req.params.id, userId },
    });
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  });

  app.post('/api/todos', requireAuth, csrfProtection, async (req, res) => {
    const userId = (req.user as any).id as string;
    const parsed = TodoCreateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });

    const created = await prisma.todo.create({ data: { ...parsed.data, userId } });
    res.status(201).json(created);
  });

  app.patch('/api/todos/:id', requireAuth, csrfProtection, async (req, res) => {
    const userId = (req.user as any).id as string;
    const parsed = TodoUpdateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });

    const exists = await prisma.todo.findFirst({ where: { id: req.params.id, userId } });
    if (!exists) return res.status(404).json({ message: 'Not found' });

    const updated = await prisma.todo.update({
      where: { id: req.params.id },
      data: parsed.data,
    });
    res.json(updated);
  });

  app.delete('/api/todos/:id', requireAuth, csrfProtection, async (req, res) => {
    const userId = (req.user as any).id as string;
    const exists = await prisma.todo.findFirst({ where: { id: req.params.id, userId } });
    if (!exists) return res.status(404).json({ message: 'Not found' });

    await prisma.todo.delete({ where: { id: req.params.id } });
    res.status(204).end();
  });

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    if (err && err.code === 'EBADCSRFTOKEN') {
      return res.status(403).json({ message: 'Bad CSRF token' });
    }
    return next(err);
  });

  app.use((_req, res) => res.status(404).json({ message: 'Not found' }));

  return app;
}
