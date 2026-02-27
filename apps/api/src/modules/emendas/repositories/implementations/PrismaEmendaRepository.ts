import { prisma, type IEmendaParlamentar } from '@spd/db';
import type { Prisma } from '@prisma/client';
import type { EmendaRepository } from '../EmendaRepository';
import type { CreateEmendaDTO, UpdateEmendaDTO } from '../../dto/EmendaDTO';

export class PrismaEmendaRepository implements EmendaRepository {
  private mapToDomain(emenda: Prisma.EmendaParlamentarGetPayload<Prisma.EmendaParlamentarDefaultArgs>): IEmendaParlamentar {
    return {
      ...emenda,
      valorIndicado: emenda.valorIndicado ? emenda.valorIndicado.toNumber() : emenda.valorIndicado,
    };
  }

  async listByConvenio(convenioId: string): Promise<IEmendaParlamentar[]> {
    const data = await prisma.emendaParlamentar.findMany({
      where: { convenioId },
      orderBy: { criadoEm: 'desc' }
    });
    return data.map(e => this.mapToDomain(e));
  }

  async findById(id: string): Promise<IEmendaParlamentar | null> {
    const data = await prisma.emendaParlamentar.findUnique({ where: { id } });
    return data ? this.mapToDomain(data) : null;
  }

  async create(data: CreateEmendaDTO): Promise<IEmendaParlamentar> {
    const created = await prisma.emendaParlamentar.create({ data });
    return this.mapToDomain(created);
  }

  async update(id: string, data: UpdateEmendaDTO): Promise<IEmendaParlamentar> {
    const updated = await prisma.emendaParlamentar.update({
      where: { id },
      data
    });
    return this.mapToDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.emendaParlamentar.delete({ where: { id } });
  }
}
