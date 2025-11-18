import { prisma, type Convenio } from '@spd/db';
import type {
  ConvenioFilters,
  ConvenioRepository
} from '../ConvenioRepository';
import type {
  CreateConvenioDTO,
  UpdateConvenioDTO
} from '../../dto/ConvenioDTO';

const defaultIncludes = {
  secretaria: true,
  orgao: true,
  programa: true,
  fonte: true,
  anexos: true,
  etapas: true
};

export class PrismaConvenioRepository implements ConvenioRepository {
  async list(filters?: ConvenioFilters): Promise<Convenio[]> {
    return prisma.convenio.findMany({
      where: {
        status: filters?.status as any,
        secretariaId: filters?.secretariaId,
        OR: filters?.search
          ? [
              { titulo: { contains: filters.search, mode: 'insensitive' } },
              { codigo: { contains: filters.search, mode: 'insensitive' } }
            ]
          : undefined
      },
      orderBy: {
        atualizadoEm: 'desc'
      },
      include: defaultIncludes
    });
  }

  async findById(id: number): Promise<Convenio | null> {
    return prisma.convenio.findUnique({
      where: { id },
      include: defaultIncludes
    });
  }

  async create(data: CreateConvenioDTO): Promise<Convenio> {
    return prisma.convenio.create({
      data: {
        ...data,
        dataAssinatura: data.dataAssinatura ?? undefined,
        dataInicioVigencia: data.dataInicioVigencia ?? undefined,
        dataFimVigencia: data.dataFimVigencia ?? undefined,
        dataPrestacaoContas: data.dataPrestacaoContas ?? undefined
      },
      include: defaultIncludes
    });
  }

  async update(id: number, data: UpdateConvenioDTO): Promise<Convenio> {
    return prisma.convenio.update({
      where: { id },
      data: {
        ...data,
        dataAssinatura:
          data.dataAssinatura === null ? null : data.dataAssinatura,
        dataInicioVigencia:
          data.dataInicioVigencia === null ? null : data.dataInicioVigencia,
        dataFimVigencia:
          data.dataFimVigencia === null ? null : data.dataFimVigencia,
        dataPrestacaoContas:
          data.dataPrestacaoContas === null ? null : data.dataPrestacaoContas
      },
      include: defaultIncludes
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.convenio.delete({ where: { id } });
  }
}
