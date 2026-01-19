import { prisma, type IContratoExecucao } from '@spd/db';
import type { ContratoRepository } from '../ContratoRepository';
import type { CreateContratoDTO, UpdateContratoDTO } from '../../dto/ContratoDTO';

export class PrismaContratoRepository implements ContratoRepository {
  async listByConvenio(convenioId: string): Promise<IContratoExecucao[]> {
    return prisma.contratoExecucao.findMany({
      where: { convenioId },
      include: {
        medicoes: true
      },
      orderBy: { criadoEm: 'desc' }
    });
  }

  async findById(id: string): Promise<IContratoExecucao | null> {
    return prisma.contratoExecucao.findUnique({ where: { id } });
  }

  async findByIdWithMedicoes(id: string): Promise<IContratoExecucao | null> {
    return prisma.contratoExecucao.findUnique({
      where: { id },
      include: {
        medicoes: {
          orderBy: { numeroMedicao: 'asc' }
        }
      }
    });
  }

  async create(data: CreateContratoDTO): Promise<IContratoExecucao> {
    return prisma.contratoExecucao.create({ data });
  }

  async update(id: string, data: UpdateContratoDTO): Promise<IContratoExecucao> {
    return prisma.contratoExecucao.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.contratoExecucao.delete({ where: { id } });
  }
}
