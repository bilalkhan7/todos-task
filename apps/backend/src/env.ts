import 'dotenv/config';

function req(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

export const env = {
  port: parseInt(process.env.PORT || '4000', 10),
  corsOrigin: req('CORS_ORIGIN'),
  sessionSecret: req('SESSION_SECRET'),
  databaseUrl: req('DATABASE_URL'),
};
