import { prisma, type IMedicao } from '@spd/db';
import type { MedicaoRepository } from '../MedicaoRepository';
import type { CreateMedicaoDTO, UpdateMedicaoDTO } from '../../dto/MedicaoDTO';

export class PrismaMedicaoRepository implements MedicaoRepository {
  async listByContrato(contratoId: string): Promise<IMedicao[]> {
    return prisma.medicao.findMany({
      where: { contratoId },
      orderBy: { numeroMedicao: 'asc' }
    });
  }

  async findById(id: string): Promise<IMedicao | null> {
    return prisma.medicao.findUnique({ where: { id } });
  }

  async getNextNumeroMedicao(contratoId: string): Promise<number> {
    const lastMedicao = await prisma.medicao.aggregate({
      where: { contratoId },
      _max: { numeroMedicao: true }
    });

    return (lastMedicao._max.numeroMedicao ?? 0) + 1;
  }

  async getTotalMedido(contratoId: string): Promise<number> {
    const result = await prisma.medicao.aggregate({
      where: { contratoId },
      _sum: { valorMedido: true }
    });

    return Number(result._sum.valorMedido ?? 0);
  }

  async create(data: CreateMedicaoDTO): Promise<IMedicao> {
    return prisma.medicao.create({ data });
  }

  async update(id: string, data: UpdateMedicaoDTO): Promise<IMedicao> {
    return prisma.medicao.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.medicao.delete({ where: { id } });
  }
}
