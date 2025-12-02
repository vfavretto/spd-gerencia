import { prisma, type Medicao } from '@spd/db';
import type { MedicaoRepository } from '../MedicaoRepository';
import type { CreateMedicaoDTO, UpdateMedicaoDTO } from '../../dto/MedicaoDTO';

export class PrismaMedicaoRepository implements MedicaoRepository {
  async listByContrato(contratoId: number): Promise<Medicao[]> {
    return prisma.medicao.findMany({
      where: { contratoId },
      orderBy: { numeroMedicao: 'asc' }
    });
  }

  async findById(id: number): Promise<Medicao | null> {
    return prisma.medicao.findUnique({
      where: { id }
    });
  }

  async getNextNumeroMedicao(contratoId: number): Promise<number> {
    const lastMedicao = await prisma.medicao.findFirst({
      where: { contratoId },
      orderBy: { numeroMedicao: 'desc' },
      select: { numeroMedicao: true }
    });
    return (lastMedicao?.numeroMedicao ?? 0) + 1;
  }

  async getTotalMedido(contratoId: number): Promise<number> {
    const result = await prisma.medicao.aggregate({
      where: { contratoId },
      _sum: { valorMedido: true }
    });
    return Number(result._sum.valorMedido ?? 0);
  }

  async create(data: CreateMedicaoDTO): Promise<Medicao> {
    return prisma.medicao.create({
      data: {
        ...data,
        dataPagamento: data.dataPagamento ?? undefined
      }
    });
  }

  async update(id: number, data: UpdateMedicaoDTO): Promise<Medicao> {
    return prisma.medicao.update({
      where: { id },
      data: {
        ...data,
        dataPagamento: data.dataPagamento === null ? null : data.dataPagamento
      }
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.medicao.delete({ where: { id } });
  }
}

