import { TipoEvento, prisma, type IEventoAgenda, type IConvenio } from '@spd/db';
import type { Prisma } from '@prisma/client';
import type { CreateEventoDTO, UpdateEventoDTO } from '../../dto/EventoDTO';
import type { EventoRepository } from '../EventoRepository';

export class PrismaEventoRepository implements EventoRepository {
  private mapToDomain(
    evento: Prisma.EventoAgendaGetPayload<{ include: { convenio: true } }>
  ): IEventoAgenda {
    return {
      ...evento,
      tipo: evento.tipo as TipoEvento,
      convenio: evento.convenio ? {
        ...evento.convenio,
        valorGlobal: evento.convenio.valorGlobal.toNumber(),
        valorRepasse: evento.convenio.valorRepasse?.toNumber(),
        valorContrapartida: evento.convenio.valorContrapartida?.toNumber(),
        etapas: [],
        anexos: []
      } as IConvenio : undefined
    };
  }

  async list(): Promise<IEventoAgenda[]> {
    const eventos = await prisma.eventoAgenda.findMany({
      include: { convenio: true },
      orderBy: { dataInicio: 'asc' }
    });
    return eventos.map((e) => this.mapToDomain(e));
  }

  async findById(id: string): Promise<IEventoAgenda | null> {
    const evento = await prisma.eventoAgenda.findUnique({
      where: { id },
      include: { convenio: true }
    });
    if (!evento) return null;
    return this.mapToDomain(evento);
  }

  async create(data: CreateEventoDTO): Promise<IEventoAgenda> {
    const { convenioId, tipo, ...rest } = data;
    const normalizedTipo = (tipo ?? TipoEvento.OUTROS) as TipoEvento;

    const evento = await prisma.eventoAgenda.create({
      data: {
        ...rest,
        tipo: normalizedTipo,
        ...(convenioId ? { convenio: { connect: { id: convenioId } } } : {})
      },
      include: { convenio: true }
    });
    
    return this.mapToDomain(evento);
  }

  async update(id: string, data: UpdateEventoDTO): Promise<IEventoAgenda> {
    const { convenioId, tipo, ...rest } = data;
    const normalizedTipo = tipo ?? undefined;

    const evento = await prisma.eventoAgenda.update({
      where: { id },
      data: {
        ...rest,
        ...(normalizedTipo ? { tipo: normalizedTipo } : {}),
        ...(convenioId !== undefined ? (convenioId ? { convenio: { connect: { id: convenioId } } } : { convenio: { disconnect: true } }) : {})
      },
      include: { convenio: true }
    });
    
    return this.mapToDomain(evento);
  }

  async delete(id: string): Promise<void> {
    await prisma.eventoAgenda.delete({ where: { id } });
  }
}
