import { prisma, type EmendaParlamentar } from '@spd/db';
import type { EmendaRepository } from '../EmendaRepository';
import type { CreateEmendaDTO, UpdateEmendaDTO } from '../../dto/EmendaDTO';

export class PrismaEmendaRepository implements EmendaRepository {
  async listByConvenio(convenioId: number): Promise<EmendaParlamentar[]> {
    return prisma.emendaParlamentar.findMany({
      where: { convenioId },
      orderBy: { criadoEm: 'desc' }
    });
  }

  async findById(id: number): Promise<EmendaParlamentar | null> {
    return prisma.emendaParlamentar.findUnique({
      where: { id }
    });
  }

  async create(data: CreateEmendaDTO): Promise<EmendaParlamentar> {
    return prisma.emendaParlamentar.create({
      data
    });
  }

  async update(id: number, data: UpdateEmendaDTO): Promise<EmendaParlamentar> {
    return prisma.emendaParlamentar.update({
      where: { id },
      data
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.emendaParlamentar.delete({ where: { id } });
  }
}

