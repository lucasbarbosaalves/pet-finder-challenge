import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { getDistanceBetweenCoordinates } from '../utils/get-distante-between-coordenates';

export class OrganizationService {
  async create(data: Prisma.OrganizationCreateInput) {
    const organization = await prisma.organization.create({
      data,
    });

    return organization;
  }

  async findById(id: string) {
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        pets: true,
      },
    });

    return organization;
  }

  async findByEmail(email: string) {
    const organization = await prisma.organization.findUnique({
      where: { email },
    });

    return organization;
  }

  async findByCity(city: string) {
    const organizations = await prisma.organization.findMany({
      where: { city },
      include: {
        pets: true,
      },
    });

    return organizations;
  }

  async findNearbyOrganizations(
    latitude: number,
    longitude: number,
    maxDistanceKm: number,
    city?: string
  ) {
    const whereClause = city ? { city } : {};

    const organizations = await prisma.organization.findMany({
      where: whereClause,
      include: {
        pets: true,
      },
    });

    // Filtra organizações por distância
    const nearbyOrganizations = organizations
      .map((org) => ({
        ...org,
        distance: getDistanceBetweenCoordinates(
          { latitude, longitude },
          { latitude: Number(org.latitude), longitude: Number(org.longitude) }
        ),
      }))
      .filter((org) => org.distance <= maxDistanceKm)
      .sort((a, b) => a.distance - b.distance);

    return nearbyOrganizations;
  }

  async getOrganizationDistance(
    orgId: string,
    userLatitude: number,
    userLongitude: number
  ) {
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    const distance = getDistanceBetweenCoordinates(
      { latitude: userLatitude, longitude: userLongitude },
      {
        latitude: Number(organization.latitude),
        longitude: Number(organization.longitude),
      }
    );

    return {
      organization,
      distance,
    };
  }
}
