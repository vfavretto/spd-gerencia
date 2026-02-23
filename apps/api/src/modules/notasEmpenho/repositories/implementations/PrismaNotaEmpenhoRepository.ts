import { TipoEmpenho, prisma, type INotaEmpenho } from '@spd/db';
import type { Prisma } from '@prisma/client';
import type { NotaEmpenhoRepository } from '../NotaEmpenhoRepository';
import type { CreateNotaEmpenhoDTO, UpdateNotaEmpenhoDTO } from '../../dto/NotaEmpenhoDTO';

export class PrismaNotaEmpenhoRepository implements NotaEmpenhoRepository {
  private mapToDomain(nota: Prisma.NotaEmpenhoGetPayload<Prisma.NotaEmpenhoDefaultArgs>): INotaEmpenho {
    return {
      ...nota,
      tipo: nota.tipo as TipoEmpenho,
      valor: nota.valor.toNumber()
    };
  }

  async listByConvenio(convenioId: string): Promise<INotaEmpenho[]> {
    const notas = await prisma.notaEmpenho.findMany({
      where: { convenioId },
      orderBy: [{ tipo: 'asc' }, { dataEmissao: 'desc' }]
    });
    return notas.map(n => this.mapToDomain(n));
  }

  async listByConvenioAndTipo(convenioId: string, tipo: string): Promise<INotaEmpenho[]> {
    const notas = await prisma.notaEmpenho.findMany({
      where: { convenioId, tipo: tipo as TipoEmpenho },
      orderBy: { dataEmissao: 'desc' }
    });
    return notas.map(n => this.mapToDomain(n));
  }

  async findById(id: string): Promise<INotaEmpenho | null> {
    const nota = await prisma.notaEmpenho.findUnique({ where: { id } });
    if (!nota) return null;
    return this.mapToDomain(nota);
  }

  async create(data: CreateNotaEmpenhoDTO): Promise<INotaEmpenho> {
    const nota = await prisma.notaEmpenho.create({ data });
    return this.mapToDomain(nota);
  }

  async update(id: string, data: UpdateNotaEmpenhoDTO): Promise<INotaEmpenho> {
    const nota = await prisma.notaEmpenho.update({
      where: { id },
      data
    });
    return this.mapToDomain(nota);
  }

  async delete(id: string): Promise<void> {
    await prisma.notaEmpenho.delete({ where: { id } });
  }

  async sumByConvenioAndTipo(convenioId: string, tipo: string): Promise<number> {
    const result = await prisma.notaEmpenho.aggregate({
      where: { convenioId, tipo: tipo as TipoEmpenho },
      _sum: { valor: true }
    });

    return Number(result._sum.valor ?? 0);
  }
}
