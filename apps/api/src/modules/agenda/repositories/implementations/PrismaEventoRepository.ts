import {
  EventoOrigem,
  TipoEvento,
  prisma,
  type IEventoAgenda,
  type IConvenio,
  type IPendencia
} from '@spd/db';
import type { Prisma } from '@prisma/client';
import type { CreateEventoDTO, UpdateEventoDTO } from '../../dto/EventoDTO';
import type { EventoRepository } from '../EventoRepository';

export class PrismaEventoRepository implements EventoRepository {
  private mapToDomain(
    evento: Prisma.EventoAgendaGetPayload<{ include: { convenio: true; pendencia: true } }>
  ): IEventoAgenda {
    return {
      ...evento,
      tipo: evento.tipo as TipoEvento,
      origem: evento.origem as EventoOrigem,
      convenio: evento.convenio ? {
        ...evento.convenio,
        valorGlobal: evento.convenio.valorGlobal.toNumber(),
        valorRepasse: evento.convenio.valorRepasse?.toNumber(),
        valorContrapartida: evento.convenio.valorContrapartida?.toNumber(),
        etapas: [],
        anexos: []
      } as IConvenio : undefined,
      pendencia: evento.pendencia ? {
        ...evento.pendencia
      } as IPendencia : undefined
    };
  }

  async list(): Promise<IEventoAgenda[]> {
    const eventos = await prisma.eventoAgenda.findMany({
      include: { convenio: true, pendencia: true },
      orderBy: { dataInicio: 'asc' }
    });
    return eventos.map((e) => this.mapToDomain(e));
  }

  async findById(id: string): Promise<IEventoAgenda | null> {
    const evento = await prisma.eventoAgenda.findUnique({
      where: { id },
      include: { convenio: true, pendencia: true }
    });
    if (!evento) return null;
    return this.mapToDomain(evento);
  }

  async create(data: CreateEventoDTO): Promise<IEventoAgenda> {
    const { convenioId, pendenciaId, tipo, ...rest } = data;
    const normalizedTipo = (tipo ?? TipoEvento.OUTROS) as TipoEvento;

    const evento = await prisma.eventoAgenda.create({
      data: {
        ...rest,
        tipo: normalizedTipo,
        origem: EventoOrigem.MANUAL,
        ...(convenioId ? { convenio: { connect: { id: convenioId } } } : {}),
        ...(pendenciaId ? { pendencia: { connect: { id: pendenciaId } } } : {})
      },
      include: { convenio: true, pendencia: true }
    });
    
    return this.mapToDomain(evento);
  }

  async update(id: string, data: UpdateEventoDTO): Promise<IEventoAgenda> {
    const { convenioId, pendenciaId, tipo, ...rest } = data;
    const normalizedTipo = tipo ?? undefined;

    const evento = await prisma.eventoAgenda.update({
      where: { id },
      data: {
        ...rest,
        ...(normalizedTipo ? { tipo: normalizedTipo } : {}),
        ...(convenioId !== undefined ? (convenioId ? { convenio: { connect: { id: convenioId } } } : { convenio: { disconnect: true } }) : {}),
        ...(pendenciaId !== undefined ? (pendenciaId ? { pendencia: { connect: { id: pendenciaId } } } : { pendencia: { disconnect: true } }) : {})
      },
      include: { convenio: true, pendencia: true }
    });
    
    return this.mapToDomain(evento);
  }

  async delete(id: string): Promise<void> {
    await prisma.eventoAgenda.delete({ where: { id } });
  }
}
