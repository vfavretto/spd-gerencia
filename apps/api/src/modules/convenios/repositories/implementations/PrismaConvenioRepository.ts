import { prisma, StatusPendencia, type IConvenio } from '@spd/db';
import type { Prisma } from '@prisma/client';
import type {
  ConvenioFilters,
  ConvenioRepository,
  ConvenioLite
} from '../ConvenioRepository';
import type {
  CreateConvenioDTO,
  UpdateConvenioDTO
} from '../../dto/ConvenioDTO';

const includeRelations = {
  secretaria: true,
  orgao: true,
  programa: true,
  fonte: true,
  emendas: true,
  financeiroContas: true,
  contratos: {
    include: {
      medicoes: {
        orderBy: { numeroMedicao: 'asc' }
      }
    }
  },
  pendencias: {
    where: { status: { in: [StatusPendencia.ABERTA, StatusPendencia.EM_ANDAMENTO] } },
    orderBy: { prioridade: 'asc' }
  },
  aditivos: {
    orderBy: { numeroAditivo: 'asc' }
  },
  fichasOrcamentarias: {
    orderBy: [{ tipo: 'asc' }, { criadoEm: 'desc' }]
  },
  notasEmpenho: {
    orderBy: [{ tipo: 'asc' }, { dataEmissao: 'desc' }]
  }
} as const satisfies Prisma.ConvenioInclude;

export class PrismaConvenioRepository implements ConvenioRepository {
  async listLite(filters?: ConvenioFilters): Promise<ConvenioLite[]> {
    const where: Record<string, unknown> = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.secretariaId) where.secretariaId = filters.secretariaId;
    if (filters?.esfera) where.esfera = filters.esfera;
    if (filters?.modalidadeRepasse) where.modalidadeRepasse = filters.modalidadeRepasse;

    if (filters?.search) {
      where.OR = [
        { titulo: { contains: filters.search, mode: 'insensitive' } },
        { codigo: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    if (filters?.dataInicioVigencia || filters?.dataFimVigencia) {
      where.dataInicioVigencia = {};
      if (filters.dataInicioVigencia) {
        (where.dataInicioVigencia as Record<string, unknown>).gte = new Date(filters.dataInicioVigencia);
      }
      if (filters.dataFimVigencia) {
        where.dataFimVigencia = { lte: new Date(filters.dataFimVigencia) };
      }
    }

    if (filters?.valorMin !== undefined || filters?.valorMax !== undefined) {
      const valorFilter: Record<string, number> = {};
      if (filters.valorMin !== undefined) valorFilter.gte = filters.valorMin;
      if (filters.valorMax !== undefined) valorFilter.lte = filters.valorMax;
      where.valorGlobal = valorFilter;
    }

    const convenios = await prisma.convenio.findMany({
      where,
      select: {
        id: true,
        codigo: true,
        titulo: true,
        objeto: true,
        status: true,
        valorGlobal: true,
        dataFimVigencia: true,
        atualizadoEm: true,
        secretaria: {
          select: { nome: true, sigla: true }
        },
        _count: {
          select: {
            pendencias: true,
            contratos: true
          }
        }
      },
      orderBy: { atualizadoEm: 'desc' }
    });

    return convenios.map((conv) => ({
      id: conv.id,
      codigo: conv.codigo,
      titulo: conv.titulo,
      objeto: conv.objeto,
      status: conv.status,
      valorGlobal: conv.valorGlobal.toNumber(),
      dataFimVigencia: conv.dataFimVigencia,
      atualizadoEm: conv.atualizadoEm,
      secretaria: conv.secretaria,
      _count: conv._count
    }));
  }

  private mapToDomain(conv: Prisma.ConvenioGetPayload<Prisma.ConvenioDefaultArgs>): IConvenio {
    return {
      ...conv,
      valorGlobal: conv.valorGlobal ? conv.valorGlobal.toNumber() : conv.valorGlobal as unknown as number,
      valorRepasse: conv.valorRepasse ? conv.valorRepasse.toNumber() : conv.valorRepasse as unknown as number,
      valorContrapartida: conv.valorContrapartida ? conv.valorContrapartida.toNumber() : conv.valorContrapartida as unknown as number,
      etapas: [],
      anexos: []
    } as unknown as IConvenio;
  }

  async list(filters?: ConvenioFilters): Promise<IConvenio[]> {
    const convenios = await prisma.convenio.findMany({
      where: {
        status: filters?.status as Prisma.EnumConvenioStatusFilter<'Convenio'> | undefined,
        secretariaId: filters?.secretariaId,
        OR: filters?.search
          ? [
            { titulo: { contains: filters.search } },
            { codigo: { contains: filters.search } }
          ]
          : undefined
      },
      include: includeRelations,
      orderBy: { atualizadoEm: 'desc' }
    });
    return convenios.map(c => this.mapToDomain(c));
  }

  async findById(id: string): Promise<IConvenio | null> {
    const convenio = await prisma.convenio.findUnique({
      where: { id },
      include: includeRelations
    });
    if (!convenio) return null;
    return this.mapToDomain(convenio);
  }

  async create(data: CreateConvenioDTO): Promise<IConvenio> {
    const convenio = await prisma.convenio.create({
      data,
      include: includeRelations
    });
    return this.mapToDomain(convenio);
  }

  async update(id: string, data: UpdateConvenioDTO): Promise<IConvenio> {
    const convenio = await prisma.convenio.update({
      where: { id },
      data,
      include: includeRelations
    });
    return this.mapToDomain(convenio);
  }

  async delete(id: string): Promise<void> {
    await prisma.convenio.delete({ where: { id } });
  }
}
