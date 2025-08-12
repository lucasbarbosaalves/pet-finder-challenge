import { FastifyInstance } from 'fastify';
import { OrganizationController } from '../controllers/organization.controller';
import { verifyJWT } from '../middlewares/verify-jwt';

export async function organizationRoutes(fastify: FastifyInstance) {
  const organizationController = new OrganizationController();

  fastify.get(
    '/me',
    {
      onRequest: [verifyJWT],
    },
    organizationController.getProfile.bind(organizationController)
  );

  fastify.get(
    '/orgs/:organizationId',
    organizationController.getProfileById.bind(organizationController)
  );
  fastify.get(
    '/orgs/city/:city',
    organizationController.getOrganizationsByCity.bind(organizationController)
  );
  fastify.get(
    '/orgs/nearby',
    organizationController.getNearbyOrganizations.bind(organizationController)
  );
  fastify.get(
    '/orgs/:organizationId/distance',
    organizationController.getOrganizationDistance.bind(organizationController)
  );
}
