import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller';

export async function authRoutes(fastify: FastifyInstance) {
  const authController = new AuthController();
  fastify.post('/register', authController.register.bind(authController));
  fastify.post('/sessions', authController.authenticate.bind(authController));
  fastify.patch('/token/refresh', authController.refresh.bind(authController));
}
