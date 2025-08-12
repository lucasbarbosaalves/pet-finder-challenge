import { FastifyInstance } from 'fastify';
import { authRoutes } from './auth.routes';
import { organizationRoutes } from './orgs.routes';
import { petRoutes } from './pets.routes';

export async function appRoutes(fastify: FastifyInstance) {
  fastify.register(authRoutes);
  fastify.register(organizationRoutes);
  fastify.register(petRoutes);
}
