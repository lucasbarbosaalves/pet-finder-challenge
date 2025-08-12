import { FastifyReply, FastifyRequest } from 'fastify';
import { OrganizationService } from '../../services/organization.service';
import { z } from 'zod';

export class OrganizationController {
  private organizationService: OrganizationService;

  constructor() {
    this.organizationService = new OrganizationService();
  }

  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    const organizationId = request.user.sub;

    try {
      const organization = await this.organizationService.findById(
        organizationId
      );

      if (!organization) {
        return reply.status(404).send({ message: 'Organization not found.' });
      }

      const { password_hash, ...organizationResponse } = organization;

      return reply.status(200).send({
        organization: organizationResponse,
      });
    } catch (error) {
      throw error;
    }
  }

  async getProfileById(request: FastifyRequest, reply: FastifyReply) {
    const getUserProfileParamsSchema = z.object({
      organizationId: z.uuid(),
    });

    const { organizationId } = getUserProfileParamsSchema.parse(request.params);

    try {
      const organization = await this.organizationService.findById(
        organizationId
      );

      if (!organization) {
        return reply.status(404).send({ message: 'Organization not found.' });
      }

      const { password_hash, ...organizationResponse } = organization;

      return reply.status(200).send({
        organization: organizationResponse,
      });
    } catch (error) {
      throw error;
    }
  }

  async getOrganizationsByCity(request: FastifyRequest, reply: FastifyReply) {
    const getOrganizationsByCityParamsSchema = z.object({
      city: z.string(),
    });

    const { city } = getOrganizationsByCityParamsSchema.parse(request.params);

    try {
      const organizations = await this.organizationService.findByCity(city);

      const organizationsResponse = organizations.map(
        ({ password_hash, ...org }) => org
      );

      return reply.status(200).send({
        organizations: organizationsResponse,
      });
    } catch (error) {
      throw error;
    }
  }

  async getNearbyOrganizations(request: FastifyRequest, reply: FastifyReply) {
    const getNearbyOrganizationsQuerySchema = z.object({
      latitude: z.string().transform((val) => parseFloat(val)),
      longitude: z.string().transform((val) => parseFloat(val)),
      maxDistance: z.string().transform((val) => parseFloat(val)),
      city: z.string().optional(),
    });

    const { latitude, longitude, maxDistance, city } =
      getNearbyOrganizationsQuerySchema.parse(request.query);

    try {
      const organizations =
        await this.organizationService.findNearbyOrganizations(
          latitude,
          longitude,
          maxDistance,
          city
        );

      const organizationsResponse = organizations.map(
        ({ password_hash, ...org }) => org
      );

      return reply.status(200).send({
        organizations: organizationsResponse,
      });
    } catch (error) {
      throw error;
    }
  }

  async getOrganizationDistance(request: FastifyRequest, reply: FastifyReply) {
    const getOrganizationDistanceParamsSchema = z.object({
      organizationId: z.uuid(),
    });

    const getOrganizationDistanceQuerySchema = z.object({
      latitude: z.string().transform((val) => parseFloat(val)),
      longitude: z.string().transform((val) => parseFloat(val)),
    });

    const { organizationId } = getOrganizationDistanceParamsSchema.parse(
      request.params
    );
    const { latitude, longitude } = getOrganizationDistanceQuerySchema.parse(
      request.query
    );

    try {
      const result = await this.organizationService.getOrganizationDistance(
        organizationId,
        latitude,
        longitude
      );

      const { password_hash, ...organizationResponse } = result.organization;

      return reply.status(200).send({
        organization: organizationResponse,
        distance: result.distance,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'Organization not found'
      ) {
        return reply.status(404).send({ message: 'Organization not found.' });
      }
      throw error;
    }
  }
}
