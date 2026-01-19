import { prisma, type IUsuario } from '@spd/db';
import type { CreateUserDTO, UserRepository } from '../UserRepository';

export class PrismaUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<IUsuario | null> {
    return prisma.usuario.findUnique({ where: { email } });
  }

  async create(data: CreateUserDTO): Promise<IUsuario> {
    return prisma.usuario.create({ data });
  }
}
