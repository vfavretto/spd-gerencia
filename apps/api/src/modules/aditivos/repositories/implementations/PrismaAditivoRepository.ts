import { prisma, type IAditivo } from '@spd/db';
import type { AditivoRepository } from '../AditivoRepository';
import type { CreateAditivoDTO, UpdateAditivoDTO } from '../../dto/AditivoDTO';

export class PrismaAditivoRepository implements AditivoRepository {
  async listByConvenio(convenioId: string): Promise<IAditivo[]> {
    return prisma.aditivo.findMany({
      where: { convenioId },
      orderBy: { numeroAditivo: 'asc' }
    });
  }

  async findById(id: string): Promise<IAditivo | null> {
    return prisma.aditivo.findUnique({ where: { id } });
  }

  async getNextNumeroAditivo(convenioId: string): Promise<number> {
    const lastAditivo = await prisma.aditivo.aggregate({
      where: { convenioId },
      _max: { numeroAditivo: true }
    });

    return (lastAditivo._max.numeroAditivo ?? 0) + 1;
  }

  async getUltimaVigencia(convenioId: string): Promise<Date | null> {
    const ultimoAditivo = await prisma.aditivo.findFirst({
      where: {
        convenioId,
        novaVigencia: { not: null }
      },
      orderBy: { numeroAditivo: 'desc' },
      select: { novaVigencia: true }
    });

    if (ultimoAditivo?.novaVigencia) {
      return ultimoAditivo.novaVigencia;
    }

    const convenio = await prisma.convenio.findUnique({
      where: { id: convenioId },
      select: { dataFimVigencia: true }
    });

    return convenio?.dataFimVigencia ?? null;
  }

  async create(data: CreateAditivoDTO): Promise<IAditivo> {
    return prisma.aditivo.create({
      data: {
        ...data,
        numeroAditivo: data.numeroAditivo ?? 0
      }
    });
  }

  async update(id: string, data: UpdateAditivoDTO): Promise<IAditivo> {
    return prisma.aditivo.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.aditivo.delete({ where: { id } });
  }
}
