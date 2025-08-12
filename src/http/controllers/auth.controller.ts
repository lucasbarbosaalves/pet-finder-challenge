import { FastifyReply, FastifyRequest } from 'fastify';
import { OrganizationService } from '../../services/organization.service';
import { z } from 'zod';
import { hash, compare } from 'bcryptjs';

export class AuthController {
  private organizationService: OrganizationService;

  constructor() {
    this.organizationService = new OrganizationService();
  }

  async register(request: FastifyRequest, reply: FastifyReply) {
    const registerBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string().min(6),
      address: z.string(),
      city: z.string(),
      whatsapp: z.string(),
      latitude: z.number(),
      longitude: z.number(),
    });

    const {
      name,
      email,
      password,
      address,
      city,
      whatsapp,
      latitude,
      longitude,
    } = registerBodySchema.parse(request.body);

    try {
      const password_hash = await hash(password, 6);

      const organization = await this.organizationService.create({
        name,
        email,
        password_hash,
        address,
        city,
        whatsapp,
        latitude,
        longitude,
      });

      return reply.status(201).send({
        organizationId: organization.id,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return reply.status(409).send({ message: 'E-mail already exists.' });
      }

      throw error;
    }
  }

  async authenticate(request: FastifyRequest, reply: FastifyReply) {
    const authenticateBodySchema = z.object({
      email: z.string().email(),
      password: z.string(),
    });

    const { email, password } = authenticateBodySchema.parse(request.body);

    try {
      const organization = await this.organizationService.findByEmail(email);

      if (!organization) {
        return reply.status(400).send({ message: 'Invalid credentials.' });
      }

      const doesPasswordMatches = await compare(
        password,
        organization.password_hash
      );

      if (!doesPasswordMatches) {
        return reply.status(400).send({ message: 'Invalid credentials.' });
      }

      const token = await reply.jwtSign(
        {
          role: 'ORGANIZATION',
        },
        {
          sign: {
            sub: organization.id,
          },
        }
      );

      const refreshToken = await reply.jwtSign(
        {
          role: 'ORGANIZATION',
        },
        {
          sign: {
            sub: organization.id,
            expiresIn: '7d',
          },
        }
      );

      return reply.status(200).send({
        token,
        refreshToken,
      });
    } catch (error) {
      throw error;
    }
  }

  async refresh(request: FastifyRequest, reply: FastifyReply) {
    await request.jwtVerify({ onlyCookie: true });

    const { role } = request.user;

    const token = await reply.jwtSign(
      { role },
      {
        sign: {
          sub: request.user.sub,
        },
      }
    );

    const refreshToken = await reply.jwtSign(
      { role },
      {
        sign: {
          sub: request.user.sub,
          expiresIn: '7d',
        },
      }
    );

    return reply.status(200).send({
      token,
      refreshToken,
    });
  }
}
