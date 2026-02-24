import { TipoAditivo, prisma, type IAditivo } from '@spd/db';
import type { Prisma } from '@prisma/client';
import type { AditivoRepository } from '../AditivoRepository';
import type { CreateAditivoDTO, UpdateAditivoDTO } from '../../dto/AditivoDTO';

export class PrismaAditivoRepository implements AditivoRepository {
  private mapToDomain(aditivo: Prisma.AditivoGetPayload<Prisma.AditivoDefaultArgs>): IAditivo {
    return {
      ...aditivo,
      convenioId: aditivo.convenioId as string,
      tipoAditivo: aditivo.tipoAditivo as TipoAditivo,
      valorAcrescimo: aditivo.valorAcrescimo ? aditivo.valorAcrescimo.toNumber() : aditivo.valorAcrescimo,
      valorSupressao: aditivo.valorSupressao ? aditivo.valorSupressao.toNumber() : aditivo.valorSupressao,
    };
  }

  async listByConvenio(convenioId: string): Promise<IAditivo[]> {
    const aditivos = await prisma.aditivo.findMany({
      where: { convenioId },
      orderBy: { numeroAditivo: 'asc' }
    });
    return aditivos.map((aditivo) => this.mapToDomain(aditivo));
  }

  async findById(id: string): Promise<IAditivo | null> {
    const aditivo = await prisma.aditivo.findUnique({
      where: { id },
    });
    if (!aditivo) return null;
    return this.mapToDomain(aditivo);
  }

  async getNextNumeroAditivo(convenioId: string, contratoId?: string | null): Promise<number> {
    const where = contratoId
      ? { convenioId, contratoId }
      : { convenioId, contratoId: null };

    const lastAditivo = await prisma.aditivo.aggregate({
      where,
      _max: { numeroAditivo: true }
    });

    return (lastAditivo._max.numeroAditivo ?? 0) + 1;
  }

  async isContratoDoConvenio(contratoId: string, convenioId: string): Promise<boolean> {
    const contrato = await prisma.contratoExecucao.findFirst({
      where: { id: contratoId, convenioId },
      select: { id: true }
    });

    return Boolean(contrato);
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
    const created = await prisma.aditivo.create({
      data: {
        ...data,
        numeroAditivo: data.numeroAditivo ?? 0
      }
    });
    return this.mapToDomain(created);
  }

  async update(id: string, data: UpdateAditivoDTO): Promise<IAditivo> {
    const updated = await prisma.aditivo.update({
      where: { id },
      data
    });
    return this.mapToDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.aditivo.delete({ where: { id } });
  }
}
