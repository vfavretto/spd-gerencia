import { prisma, type IUsuario } from '@spd/db';
import type { CreateUserDTO, UpdateUserDTO, UserRepository } from '../UserRepository';

import { UsuarioRole } from '@prisma/client';

export class PrismaUserRepository implements UserRepository {
  async findById(id: string): Promise<IUsuario | null> {
    return prisma.usuario.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<IUsuario | null> {
    return prisma.usuario.findUnique({ where: { email } });
  }

  async findByMatricula(matricula: string): Promise<IUsuario | null> {
    return prisma.usuario.findUnique({ where: { matricula } });
  }

  async create(data: CreateUserDTO): Promise<IUsuario> {
    return prisma.usuario.create({
      data: {
        ...data,
        role: data.role ?? UsuarioRole.OBSERVADOR
      }
    });
  }

  async update(id: string, data: UpdateUserDTO): Promise<IUsuario> {
    return prisma.usuario.update({
      where: { id },
      data
    });
  }

  async findAll(): Promise<IUsuario[]> {
    return prisma.usuario.findMany({
      orderBy: { criadoEm: 'desc' }
    });
  }
}
