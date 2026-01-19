import { prisma, type IFinanceiroContas } from '@spd/db';
import type { FinanceiroRepository } from '../FinanceiroRepository';
import type { CreateFinanceiroDTO, UpdateFinanceiroDTO } from '../../dto/FinanceiroDTO';

export class PrismaFinanceiroRepository implements FinanceiroRepository {
  async findByConvenio(convenioId: string): Promise<IFinanceiroContas | null> {
    return prisma.financeiroContas.findUnique({
      where: { convenioId }
    });
  }

  async findById(id: string): Promise<IFinanceiroContas | null> {
    return prisma.financeiroContas.findUnique({
      where: { id }
    });
  }

  async create(data: CreateFinanceiroDTO): Promise<IFinanceiroContas> {
    return prisma.financeiroContas.create({ data });
  }

  async update(id: string, data: UpdateFinanceiroDTO): Promise<IFinanceiroContas> {
    return prisma.financeiroContas.update({
      where: { id },
      data
    });
  }

  async upsertByConvenio(
    convenioId: string,
    data: Omit<CreateFinanceiroDTO, 'convenioId'>
  ): Promise<IFinanceiroContas> {
    return prisma.financeiroContas.upsert({
      where: { convenioId },
      update: data,
      create: {
        ...data,
        convenioId
      }
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.financeiroContas.delete({ where: { id } });
  }
}
