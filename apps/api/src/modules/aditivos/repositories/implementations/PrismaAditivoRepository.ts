import { prisma, type Aditivo } from '@spd/db';
import type { AditivoRepository } from '../AditivoRepository';
import type { CreateAditivoDTO, UpdateAditivoDTO } from '../../dto/AditivoDTO';

export class PrismaAditivoRepository implements AditivoRepository {
  async listByConvenio(convenioId: number): Promise<Aditivo[]> {
    return prisma.aditivo.findMany({
      where: { convenioId },
      orderBy: { numeroAditivo: 'asc' }
    });
  }

  async findById(id: number): Promise<Aditivo | null> {
    return prisma.aditivo.findUnique({
      where: { id }
    });
  }

  async getNextNumeroAditivo(convenioId: number): Promise<number> {
    const lastAditivo = await prisma.aditivo.findFirst({
      where: { convenioId },
      orderBy: { numeroAditivo: 'desc' },
      select: { numeroAditivo: true }
    });
    return (lastAditivo?.numeroAditivo ?? 0) + 1;
  }

  async getUltimaVigencia(convenioId: number): Promise<Date | null> {
    // Primeiro verifica se há aditivos com nova vigência
    const ultimoAditivo = await prisma.aditivo.findFirst({
      where: { convenioId, novaVigencia: { not: null } },
      orderBy: { numeroAditivo: 'desc' },
      select: { novaVigencia: true }
    });

    if (ultimoAditivo?.novaVigencia) {
      return ultimoAditivo.novaVigencia;
    }

    // Senão, retorna a vigência original do convênio
    const convenio = await prisma.convenio.findUnique({
      where: { id: convenioId },
      select: { dataFimVigencia: true }
    });

    return convenio?.dataFimVigencia ?? null;
  }

  async create(data: CreateAditivoDTO): Promise<Aditivo> {
    return prisma.aditivo.create({
      data: {
        ...data,
        numeroAditivo: data.numeroAditivo!,
        dataAssinatura: data.dataAssinatura ?? undefined,
        novaVigencia: data.novaVigencia ?? undefined
      }
    });
  }

  async update(id: number, data: UpdateAditivoDTO): Promise<Aditivo> {
    return prisma.aditivo.update({
      where: { id },
      data: {
        ...data,
        dataAssinatura: data.dataAssinatura === null ? null : data.dataAssinatura,
        novaVigencia: data.novaVigencia === null ? null : data.novaVigencia
      }
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.aditivo.delete({ where: { id } });
  }
}

