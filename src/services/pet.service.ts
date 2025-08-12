import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { getDistanceBetweenCoordinates } from '../utils/get-distante-between-coordenates';

export interface PetFilters {
  city: string;
  species?: string;
  breed?: string;
  age?: string; // puppy, adult, senior
  size?: string; // small, medium, large
  latitude?: number;
  longitude?: number;
  maxDistance?: number; // em km
}

export class PetService {
  async create(data: Prisma.PetCreateInput) {
    const pet = await prisma.pet.create({
      data,
    });

    return pet;
  }

  async findById(id: string) {
    const pet = await prisma.pet.findUnique({
      where: { id },
      include: {
        organization: true,
      },
    });

    return pet;
  }

  async findManyByFilters(filters: PetFilters) {
    const { city, latitude, longitude, maxDistance, ...petFilters } = filters;

    // Busca pets na cidade especificada
    const pets = await prisma.pet.findMany({
      where: {
        organization: {
          city,
        },
        ...Object.fromEntries(
          Object.entries(petFilters).filter(([_, value]) => value !== undefined)
        ),
      },
      include: {
        organization: true,
      },
    });

    // Se coordenadas e distância máxima foram fornecidas, filtra por proximidade
    if (latitude && longitude && maxDistance) {
      return pets.filter((pet) => {
        const distance = getDistanceBetweenCoordinates(
          { latitude, longitude },
          {
            latitude: Number(pet.organization.latitude),
            longitude: Number(pet.organization.longitude),
          }
        );

        return distance <= maxDistance;
      });
    }

    return pets;
  }

  async findNearbyPets(
    userLatitude: number,
    userLongitude: number,
    maxDistanceKm: number,
    city: string,
    otherFilters?: Omit<
      PetFilters,
      'city' | 'latitude' | 'longitude' | 'maxDistance'
    >
  ) {
    // Primeiro busca todas as organizações na cidade
    const organizations = await prisma.organization.findMany({
      where: { city },
      include: {
        pets: {
          where: otherFilters
            ? {
                ...Object.fromEntries(
                  Object.entries(otherFilters).filter(
                    ([_, value]) => value !== undefined
                  )
                ),
              }
            : undefined,
        },
      },
    });

    // Filtra organizações por distância e coleta pets
    const nearbyPets = organizations
      .filter((org) => {
        const distance = getDistanceBetweenCoordinates(
          { latitude: userLatitude, longitude: userLongitude },
          { latitude: Number(org.latitude), longitude: Number(org.longitude) }
        );
        return distance <= maxDistanceKm;
      })
      .flatMap((org) =>
        org.pets.map((pet) => ({
          ...pet,
          organization: org,
          distance: getDistanceBetweenCoordinates(
            { latitude: userLatitude, longitude: userLongitude },
            { latitude: Number(org.latitude), longitude: Number(org.longitude) }
          ),
        }))
      )
      .sort((a, b) => a.distance - b.distance); // Ordena por distância

    return nearbyPets;
  }

  async findPetsByOrganization(orgId: string) {
    const pets = await prisma.pet.findMany({
      where: { organizationId: orgId },
      include: {
        organization: true,
      },
    });

    return pets;
  }
}
