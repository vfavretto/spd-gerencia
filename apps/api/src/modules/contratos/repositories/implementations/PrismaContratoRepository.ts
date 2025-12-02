import { prisma, type ContratoExecucao } from '@spd/db';
import type { ContratoRepository } from '../ContratoRepository';
import type { CreateContratoDTO, UpdateContratoDTO } from '../../dto/ContratoDTO';

export class PrismaContratoRepository implements ContratoRepository {
  async listByConvenio(convenioId: number): Promise<ContratoExecucao[]> {
    return prisma.contratoExecucao.findMany({
      where: { convenioId },
      include: { medicoes: true },
      orderBy: { criadoEm: 'desc' }
    });
  }

  async findById(id: number): Promise<ContratoExecucao | null> {
    return prisma.contratoExecucao.findUnique({
      where: { id }
    });
  }

  async findByIdWithMedicoes(id: number): Promise<ContratoExecucao | null> {
    return prisma.contratoExecucao.findUnique({
      where: { id },
      include: { medicoes: { orderBy: { numeroMedicao: 'asc' } } }
    });
  }

  async create(data: CreateContratoDTO): Promise<ContratoExecucao> {
    return prisma.contratoExecucao.create({
      data: {
        ...data,
        dataAssinatura: data.dataAssinatura ?? undefined,
        dataVigenciaInicio: data.dataVigenciaInicio ?? undefined,
        dataVigenciaFim: data.dataVigenciaFim ?? undefined,
        dataOIS: data.dataOIS ?? undefined
      }
    });
  }

  async update(id: number, data: UpdateContratoDTO): Promise<ContratoExecucao> {
    return prisma.contratoExecucao.update({
      where: { id },
      data: {
        ...data,
        dataAssinatura: data.dataAssinatura === null ? null : data.dataAssinatura,
        dataVigenciaInicio: data.dataVigenciaInicio === null ? null : data.dataVigenciaInicio,
        dataVigenciaFim: data.dataVigenciaFim === null ? null : data.dataVigenciaFim,
        dataOIS: data.dataOIS === null ? null : data.dataOIS
      }
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.contratoExecucao.delete({ where: { id } });
  }
}

