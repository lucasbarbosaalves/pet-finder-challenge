import fastify from 'fastify';
import jwt from '@fastify/jwt';
import { appRoutes } from './http/routes/app.routes';
import { env } from './env';

export const app = fastify();

app.register(jwt, {
  secret: env.JWT_SECRET,
});

app.register(appRoutes);
