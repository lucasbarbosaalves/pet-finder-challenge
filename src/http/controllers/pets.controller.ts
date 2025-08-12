import { FastifyReply, FastifyRequest } from 'fastify';
import { PetService } from '../../services/pet.service';
import { z } from 'zod';

export class PetController {
  private petService: PetService;

  constructor() {
    this.petService = new PetService();
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const createPetBodySchema = z.object({
      name: z.string(),
      species: z.string(),
      breed: z.string().optional(),
      age: z.string(),
      size: z.string(),
      description: z.string().optional(),
    });

    const { name, species, breed, age, size, description } =
      createPetBodySchema.parse(request.body);

    try {
      const pet = await this.petService.create({
        name,
        species,
        breed,
        age,
        size,
        description,
        organization: {
          connect: {
            id: request.user.sub,
          },
        },
      });

      return reply.status(201).send({ pet });
    } catch (error) {
      throw error;
    }
  }

  async getPetDetails(request: FastifyRequest, reply: FastifyReply) {
    const getPetDetailsParamsSchema = z.object({
      petId: z.string().uuid(),
    });

    const { petId } = getPetDetailsParamsSchema.parse(request.params);

    try {
      const pet = await this.petService.findById(petId);

      if (!pet) {
        return reply.status(404).send({ message: 'Pet not found.' });
      }

      return reply.status(200).send({ pet });
    } catch (error) {
      throw error;
    }
  }

  async searchPets(request: FastifyRequest, reply: FastifyReply) {
    const searchPetsQuerySchema = z.object({
      city: z.string(),
      species: z.string().optional(),
      breed: z.string().optional(),
      age: z.string().optional(),
      size: z.string().optional(),
      latitude: z
        .string()
        .transform((val) => parseFloat(val))
        .optional(),
      longitude: z
        .string()
        .transform((val) => parseFloat(val))
        .optional(),
      maxDistance: z
        .string()
        .transform((val) => parseFloat(val))
        .optional(),
    });

    const {
      city,
      species,
      breed,
      age,
      size,
      latitude,
      longitude,
      maxDistance,
    } = searchPetsQuerySchema.parse(request.query);

    try {
      const pets = await this.petService.findManyByFilters({
        city,
        species,
        breed,
        age,
        size,
        latitude,
        longitude,
        maxDistance,
      });

      return reply.status(200).send({ pets });
    } catch (error) {
      throw error;
    }
  }

  async searchNearbyPets(request: FastifyRequest, reply: FastifyReply) {
    const searchNearbyPetsQuerySchema = z.object({
      latitude: z.string().transform((val) => parseFloat(val)),
      longitude: z.string().transform((val) => parseFloat(val)),
      maxDistance: z.string().transform((val) => parseFloat(val)),
      city: z.string(),
      species: z.string().optional(),
      breed: z.string().optional(),
      age: z.string().optional(),
      size: z.string().optional(),
    });

    const {
      latitude,
      longitude,
      maxDistance,
      city,
      species,
      breed,
      age,
      size,
    } = searchNearbyPetsQuerySchema.parse(request.query);

    try {
      const otherFilters = {
        ...(species && { species }),
        ...(breed && { breed }),
        ...(age && { age }),
        ...(size && { size }),
      };

      const pets = await this.petService.findNearbyPets(
        latitude,
        longitude,
        maxDistance,
        city,
        Object.keys(otherFilters).length > 0 ? otherFilters : undefined
      );

      return reply.status(200).send({ pets });
    } catch (error) {
      throw error;
    }
  }
}
