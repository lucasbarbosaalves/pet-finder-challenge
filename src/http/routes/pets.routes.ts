import { FastifyInstance } from 'fastify';
import { PetController } from '../controllers/pets.controller';
import { verifyJWT } from '../middlewares/verify-jwt';

export async function petRoutes(fastify: FastifyInstance) {
  const petController = new PetController();

  fastify.post(
    '/pets',
    {
      onRequest: [verifyJWT],
    },
    petController.create.bind(petController)
  );

  fastify.get('/pets/search', petController.searchPets.bind(petController));
  fastify.get(
    '/pets/nearby',
    petController.searchNearbyPets.bind(petController)
  );
  fastify.get('/pets/:petId', petController.getPetDetails.bind(petController));
}
