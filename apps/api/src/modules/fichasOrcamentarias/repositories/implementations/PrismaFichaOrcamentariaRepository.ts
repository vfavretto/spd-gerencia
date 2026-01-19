import { prisma, type IFichaOrcamentaria } from '@spd/db';
import type { FichaOrcamentariaRepository } from '../FichaOrcamentariaRepository';
import type { CreateFichaOrcamentariaDTO, UpdateFichaOrcamentariaDTO } from '../../dto/FichaOrcamentariaDTO';

export class PrismaFichaOrcamentariaRepository implements FichaOrcamentariaRepository {
  async listByConvenio(convenioId: string): Promise<IFichaOrcamentaria[]> {
    return prisma.fichaOrcamentaria.findMany({
      where: { convenioId },
      orderBy: [{ tipo: 'asc' }, { criadoEm: 'desc' }]
    });
  }

  async listByConvenioAndTipo(convenioId: string, tipo: string): Promise<IFichaOrcamentaria[]> {
    return prisma.fichaOrcamentaria.findMany({
      where: { convenioId, tipo: tipo as never },
      orderBy: { criadoEm: 'desc' }
    });
  }

  async findById(id: string): Promise<IFichaOrcamentaria | null> {
    return prisma.fichaOrcamentaria.findUnique({ where: { id } });
  }

  async create(data: CreateFichaOrcamentariaDTO): Promise<IFichaOrcamentaria> {
    return prisma.fichaOrcamentaria.create({ data });
  }

  async update(id: string, data: UpdateFichaOrcamentariaDTO): Promise<IFichaOrcamentaria> {
    return prisma.fichaOrcamentaria.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.fichaOrcamentaria.delete({ where: { id } });
  }
}
