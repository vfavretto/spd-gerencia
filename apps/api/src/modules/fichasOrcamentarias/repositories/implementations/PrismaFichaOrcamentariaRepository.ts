import { TipoFichaOrcamentaria, prisma, type IFichaOrcamentaria } from '@spd/db';
import type { Prisma } from '@prisma/client';
import type { FichaOrcamentariaRepository } from '../FichaOrcamentariaRepository';
import type { CreateFichaOrcamentariaDTO, UpdateFichaOrcamentariaDTO } from '../../dto/FichaOrcamentariaDTO';

export class PrismaFichaOrcamentariaRepository implements FichaOrcamentariaRepository {
  private mapToDomain(
    ficha: Prisma.FichaOrcamentariaGetPayload<Prisma.FichaOrcamentariaDefaultArgs>
  ): IFichaOrcamentaria {
    return {
      ...ficha,
      tipo: ficha.tipo as TipoFichaOrcamentaria,
      valor: ficha.valor ? ficha.valor.toNumber() : ficha.valor
    };
  }

  async listByConvenio(convenioId: string): Promise<IFichaOrcamentaria[]> {
    const fichas = await prisma.fichaOrcamentaria.findMany({
      where: { convenioId },
      orderBy: [{ tipo: 'asc' }, { criadoEm: 'desc' }]
    });
    return fichas.map(f => this.mapToDomain(f));
  }

  async listByConvenioAndTipo(convenioId: string, tipo: string): Promise<IFichaOrcamentaria[]> {
    const fichas = await prisma.fichaOrcamentaria.findMany({
      where: { convenioId, tipo: tipo as TipoFichaOrcamentaria },
      orderBy: { criadoEm: 'desc' }
    });
    return fichas.map((ficha) => this.mapToDomain(ficha));
  }

  async findById(id: string): Promise<IFichaOrcamentaria | null> {
    const ficha = await prisma.fichaOrcamentaria.findUnique({ where: { id } });
    if (!ficha) return null;
    return this.mapToDomain(ficha);
  }

  async create(data: CreateFichaOrcamentariaDTO): Promise<IFichaOrcamentaria> {
    const ficha = await prisma.fichaOrcamentaria.create({ data });
    return this.mapToDomain(ficha);
  }

  async update(id: string, data: UpdateFichaOrcamentariaDTO): Promise<IFichaOrcamentaria> {
    const ficha = await prisma.fichaOrcamentaria.update({
      where: { id },
      data
    });
    return this.mapToDomain(ficha);
  }

  async delete(id: string): Promise<void> {
    await prisma.fichaOrcamentaria.delete({ where: { id } });
  }
}
