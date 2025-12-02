import { prisma, type FinanceiroContas } from '@spd/db';
import type { FinanceiroRepository } from '../FinanceiroRepository';
import type { CreateFinanceiroDTO, UpdateFinanceiroDTO } from '../../dto/FinanceiroDTO';

export class PrismaFinanceiroRepository implements FinanceiroRepository {
  async findByConvenio(convenioId: number): Promise<FinanceiroContas | null> {
    return prisma.financeiroContas.findUnique({
      where: { convenioId }
    });
  }

  async findById(id: number): Promise<FinanceiroContas | null> {
    return prisma.financeiroContas.findUnique({
      where: { id }
    });
  }

  async create(data: CreateFinanceiroDTO): Promise<FinanceiroContas> {
    return prisma.financeiroContas.create({
      data
    });
  }

  async update(id: number, data: UpdateFinanceiroDTO): Promise<FinanceiroContas> {
    return prisma.financeiroContas.update({
      where: { id },
      data
    });
  }

  async upsertByConvenio(
    convenioId: number,
    data: Omit<CreateFinanceiroDTO, 'convenioId'>
  ): Promise<FinanceiroContas> {
    return prisma.financeiroContas.upsert({
      where: { convenioId },
      update: data,
      create: { ...data, convenioId }
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.financeiroContas.delete({ where: { id } });
  }
}

