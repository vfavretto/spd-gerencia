import { prisma, type EventoAgenda } from '@spd/db';
import type { CreateEventoDTO, UpdateEventoDTO } from '../../dto/EventoDTO';
import type { EventoRepository } from '../EventoRepository';

export class PrismaEventoRepository implements EventoRepository {
  list(): Promise<EventoAgenda[]> {
    return prisma.eventoAgenda.findMany({
      include: { convenio: true },
      orderBy: { dataInicio: 'asc' }
    });
  }

  findById(id: number): Promise<EventoAgenda | null> {
    return prisma.eventoAgenda.findUnique({
      where: { id },
      include: { convenio: true }
    });
  }

  create(data: CreateEventoDTO): Promise<EventoAgenda> {
    return prisma.eventoAgenda.create({
      data,
      include: { convenio: true }
    });
  }

  update(id: number, data: UpdateEventoDTO): Promise<EventoAgenda> {
    return prisma.eventoAgenda.update({
      where: { id },
      data,
      include: { convenio: true }
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.eventoAgenda.delete({ where: { id } });
  }
}
