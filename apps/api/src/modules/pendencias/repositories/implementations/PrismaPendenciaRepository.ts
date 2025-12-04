import { prisma, type Pendencia } from '@spd/db';
import type { PendenciaFilters, PendenciaRepository } from '../PendenciaRepository';
import type { CreatePendenciaDTO, UpdatePendenciaDTO } from '../../dto/PendenciaDTO';

export class PrismaPendenciaRepository implements PendenciaRepository {
  async listByConvenio(convenioId: number, filters?: PendenciaFilters): Promise<Pendencia[]> {
    return prisma.pendencia.findMany({
      where: {
        convenioId,
        status: filters?.status as Pendencia['status'],
        prioridade: filters?.prioridade
      },
      include: { criadoPor: { select: { id: true, nome: true } } },
      orderBy: [{ prioridade: 'asc' }, { criadoEm: 'desc' }]
    });
  }

  async findById(id: number): Promise<Pendencia | null> {
    return prisma.pendencia.findUnique({
      where: { id },
      include: { criadoPor: { select: { id: true, nome: true } } }
    });
  }

  async countByStatus(convenioId: number): Promise<Record<string, number>> {
    const counts = await prisma.pendencia.groupBy({
      by: ['status'],
      where: { convenioId },
      _count: true
    });

    return counts.reduce(
      (acc, item) => {
        acc[item.status] = item._count;
        return acc;
      },
      {} as Record<string, number>
    );
  }

  async create(data: CreatePendenciaDTO): Promise<Pendencia> {
    return prisma.pendencia.create({
      data: {
        descricao: data.descricao,
        responsavel: data.responsavel,
        prazo: data.prazo ?? undefined,
        status: (data.status as Pendencia['status']) ?? 'ABERTA',
        prioridade: data.prioridade ?? 2,
        resolucao: data.resolucao,
        dataResolucao: data.dataResolucao ?? undefined,
        convenioId: data.convenioId,
        criadoPorId: data.criadoPorId
      },
      include: { criadoPor: { select: { id: true, nome: true } } }
    });
  }

  async update(id: number, data: UpdatePendenciaDTO): Promise<Pendencia> {
    return prisma.pendencia.update({
      where: { id },
      data: {
        descricao: data.descricao,
        responsavel: data.responsavel,
        prazo: data.prazo === null ? null : data.prazo,
        status: data.status as Pendencia['status'],
        prioridade: data.prioridade,
        resolucao: data.resolucao,
        dataResolucao: data.dataResolucao === null ? null : data.dataResolucao
      },
      include: { criadoPor: { select: { id: true, nome: true } } }
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.pendencia.delete({ where: { id } });
  }
}

