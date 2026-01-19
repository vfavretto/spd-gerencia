import { prisma, type IEventoAgenda } from '@spd/db';
import type { CreateEventoDTO, UpdateEventoDTO } from '../../dto/EventoDTO';
import type { EventoRepository } from '../EventoRepository';

export class PrismaEventoRepository implements EventoRepository {
  async list(): Promise<IEventoAgenda[]> {
    return prisma.eventoAgenda.findMany({
      include: { convenio: true },
      orderBy: { dataInicio: 'asc' }
    });
  }

  async findById(id: string): Promise<IEventoAgenda | null> {
    return prisma.eventoAgenda.findUnique({
      where: { id },
      include: { convenio: true }
    });
  }

  async create(data: CreateEventoDTO): Promise<IEventoAgenda> {
    return prisma.eventoAgenda.create({
      data,
      include: { convenio: true }
    });
  }

  async update(id: string, data: UpdateEventoDTO): Promise<IEventoAgenda> {
    return prisma.eventoAgenda.update({
      where: { id },
      data,
      include: { convenio: true }
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.eventoAgenda.delete({ where: { id } });
  }
}
