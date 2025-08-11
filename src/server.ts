import { app } from './app';
import { env } from './env';

app
  .listen({
    host: '0.0.0.0',
    port: env.HTTP_PORT,
  })
  .then(() => {
    console.log(`Server is running at http://0.0.0.0:${env.HTTP_PORT}`);
  });
