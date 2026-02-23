import { prisma, type IMedicao } from '@spd/db';
import type { Prisma } from '@prisma/client';
import type { MedicaoRepository } from '../MedicaoRepository';
import type { CreateMedicaoDTO, UpdateMedicaoDTO } from '../../dto/MedicaoDTO';

export class PrismaMedicaoRepository implements MedicaoRepository {
  private mapToDomain(medicao: Prisma.MedicaoGetPayload<Prisma.MedicaoDefaultArgs>): IMedicao {
    return {
      ...medicao,
      percentualFisico: medicao.percentualFisico ? medicao.percentualFisico.toNumber() : medicao.percentualFisico,
      valorMedido: medicao.valorMedido.toNumber(),
      valorPago: medicao.valorPago ? medicao.valorPago.toNumber() : medicao.valorPago
    };
  }

  async listByContrato(contratoId: string): Promise<IMedicao[]> {
    const medicoes = await prisma.medicao.findMany({
      where: { contratoId },
      orderBy: { numeroMedicao: 'asc' }
    });
    return medicoes.map(m => this.mapToDomain(m));
  }

  async findById(id: string): Promise<IMedicao | null> {
    const medicao = await prisma.medicao.findUnique({ where: { id } });
    if (!medicao) return null;
    return this.mapToDomain(medicao);
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
    const medicao = await prisma.medicao.create({ data });
    return this.mapToDomain(medicao);
  }

  async update(id: string, data: UpdateMedicaoDTO): Promise<IMedicao> {
    const medicao = await prisma.medicao.update({
      where: { id },
      data
    });
    return this.mapToDomain(medicao);
  }

  async delete(id: string): Promise<void> {
    await prisma.medicao.delete({ where: { id } });
  }
}
