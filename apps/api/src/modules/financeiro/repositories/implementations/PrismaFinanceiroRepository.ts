import { prisma, type IFinanceiroContas } from '@spd/db';
import type { Prisma } from '@prisma/client';
import type { FinanceiroRepository } from '../FinanceiroRepository';
import type { CreateFinanceiroDTO, UpdateFinanceiroDTO } from '../../dto/FinanceiroDTO';

export class PrismaFinanceiroRepository implements FinanceiroRepository {
  private mapToDomain(
    financeiro: Prisma.FinanceiroContasGetPayload<Prisma.FinanceiroContasDefaultArgs>
  ): IFinanceiroContas {
    return {
      ...financeiro,
      valorLiberadoTotal: financeiro.valorLiberadoTotal ? financeiro.valorLiberadoTotal.toNumber() : financeiro.valorLiberadoTotal,
      saldoRendimentos: financeiro.saldoRendimentos ? financeiro.saldoRendimentos.toNumber() : financeiro.saldoRendimentos,
      valorCPExclusiva: financeiro.valorCPExclusiva ? financeiro.valorCPExclusiva.toNumber() : financeiro.valorCPExclusiva,
    };
  }

  async findByConvenio(convenioId: string): Promise<IFinanceiroContas | null> {
    const data = await prisma.financeiroContas.findUnique({
      where: { convenioId }
    });
    return data ? this.mapToDomain(data) : null;
  }

  async findById(id: string): Promise<IFinanceiroContas | null> {
    const data = await prisma.financeiroContas.findUnique({
      where: { id }
    });
    return data ? this.mapToDomain(data) : null;
  }

  async create(data: CreateFinanceiroDTO): Promise<IFinanceiroContas> {
    const financeiro = await prisma.financeiroContas.create({ data });
    return this.mapToDomain(financeiro);
  }

  async update(id: string, data: UpdateFinanceiroDTO): Promise<IFinanceiroContas> {
    const financeiro = await prisma.financeiroContas.update({
      where: { id },
      data
    });
    return this.mapToDomain(financeiro);
  }

  async upsertByConvenio(
    convenioId: string,
    data: Omit<CreateFinanceiroDTO, 'convenioId'>
  ): Promise<IFinanceiroContas> {
    const financeiro = await prisma.financeiroContas.upsert({
      where: { convenioId },
      update: data,
      create: {
        ...data,
        convenioId
      }
    });
    return this.mapToDomain(financeiro);
  }

  async delete(id: string): Promise<void> {
    await prisma.financeiroContas.delete({ where: { id } });
  }
}
