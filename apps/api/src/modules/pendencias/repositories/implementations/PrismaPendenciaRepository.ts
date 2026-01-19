import { prisma, StatusPendencia, type IPendencia } from '@spd/db';
import type { PendenciaFilters, PendenciaRepository } from '../PendenciaRepository';
import type { CreatePendenciaDTO, UpdatePendenciaDTO } from '../../dto/PendenciaDTO';

export class PrismaPendenciaRepository implements PendenciaRepository {
  async listByConvenio(convenioId: string, filters?: PendenciaFilters): Promise<IPendencia[]> {
    return prisma.pendencia.findMany({
      where: {
        convenioId,
        status: filters?.status,
        prioridade: filters?.prioridade
      },
      include: {
        criadoPor: {
          select: { id: true, nome: true }
        }
      },
      orderBy: [{ prioridade: 'asc' }, { criadoEm: 'desc' }]
    });
  }

  async findById(id: string): Promise<IPendencia | null> {
    return prisma.pendencia.findUnique({
      where: { id },
      include: {
        criadoPor: {
          select: { id: true, nome: true }
        }
      }
    });
  }

  async countByStatus(convenioId: string): Promise<Record<string, number>> {
    const counts = await prisma.pendencia.groupBy({
      by: ['status'],
      where: { convenioId },
      _count: { status: true }
    });

    return counts.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<string, number>);
  }

  async create(data: CreatePendenciaDTO): Promise<IPendencia> {
    return prisma.pendencia.create({
      data: {
        descricao: data.descricao,
        responsavel: data.responsavel,
        prazo: data.prazo,
        status: (data.status as StatusPendencia) ?? StatusPendencia.ABERTA,
        prioridade: data.prioridade ?? 2,
        resolucao: data.resolucao,
        dataResolucao: data.dataResolucao,
        convenioId: data.convenioId,
        criadoPorId: data.criadoPorId
      },
      include: {
        criadoPor: {
          select: { id: true, nome: true }
        }
      }
    });
  }

  async update(id: string, data: UpdatePendenciaDTO): Promise<IPendencia> {
    return prisma.pendencia.update({
      where: { id },
      data,
      include: {
        criadoPor: {
          select: { id: true, nome: true }
        }
      }
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.pendencia.delete({ where: { id } });
  }
}
