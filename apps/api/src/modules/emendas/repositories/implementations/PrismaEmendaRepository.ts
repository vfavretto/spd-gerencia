import { prisma, type IEmendaParlamentar } from '@spd/db';
import type { EmendaRepository } from '../EmendaRepository';
import type { CreateEmendaDTO, UpdateEmendaDTO } from '../../dto/EmendaDTO';

export class PrismaEmendaRepository implements EmendaRepository {
  async listByConvenio(convenioId: string): Promise<IEmendaParlamentar[]> {
    return prisma.emendaParlamentar.findMany({
      where: { convenioId },
      orderBy: { criadoEm: 'desc' }
    });
  }

  async findById(id: string): Promise<IEmendaParlamentar | null> {
    return prisma.emendaParlamentar.findUnique({ where: { id } });
  }

  async create(data: CreateEmendaDTO): Promise<IEmendaParlamentar> {
    return prisma.emendaParlamentar.create({ data });
  }

  async update(id: string, data: UpdateEmendaDTO): Promise<IEmendaParlamentar> {
    return prisma.emendaParlamentar.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.emendaParlamentar.delete({ where: { id } });
  }
}
