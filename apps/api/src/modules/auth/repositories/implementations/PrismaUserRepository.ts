import { prisma, type Usuario } from '@spd/db';
import type { CreateUserDTO, UserRepository } from '../UserRepository';

export class PrismaUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<Usuario | null> {
    return prisma.usuario.findUnique({ where: { email } });
  }

  async create(data: CreateUserDTO): Promise<Usuario> {
    return prisma.usuario.create({ data });
  }
}
