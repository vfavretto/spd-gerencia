import { prisma, type INotaEmpenho } from '@spd/db';
import type { NotaEmpenhoRepository } from '../NotaEmpenhoRepository';
import type { CreateNotaEmpenhoDTO, UpdateNotaEmpenhoDTO } from '../../dto/NotaEmpenhoDTO';

export class PrismaNotaEmpenhoRepository implements NotaEmpenhoRepository {
  async listByConvenio(convenioId: string): Promise<INotaEmpenho[]> {
    return prisma.notaEmpenho.findMany({
      where: { convenioId },
      orderBy: [{ tipo: 'asc' }, { dataEmissao: 'desc' }]
    });
  }

  async listByConvenioAndTipo(convenioId: string, tipo: string): Promise<INotaEmpenho[]> {
    return prisma.notaEmpenho.findMany({
      where: { convenioId, tipo: tipo as never },
      orderBy: { dataEmissao: 'desc' }
    });
  }

  async findById(id: string): Promise<INotaEmpenho | null> {
    return prisma.notaEmpenho.findUnique({ where: { id } });
  }

  async create(data: CreateNotaEmpenhoDTO): Promise<INotaEmpenho> {
    return prisma.notaEmpenho.create({ data });
  }

  async update(id: string, data: UpdateNotaEmpenhoDTO): Promise<INotaEmpenho> {
    return prisma.notaEmpenho.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.notaEmpenho.delete({ where: { id } });
  }

  async sumByConvenioAndTipo(convenioId: string, tipo: string): Promise<number> {
    const result = await prisma.notaEmpenho.aggregate({
      where: { convenioId, tipo: tipo as never },
      _sum: { valor: true }
    });

    return Number(result._sum.valor ?? 0);
  }
}
