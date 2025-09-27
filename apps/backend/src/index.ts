import { createApp } from './app';
import { env } from './env';

const app = createApp();

app.listen(env.port, () => {
  console.log(`Backend running on http://localhost:${env.port}`);
});
