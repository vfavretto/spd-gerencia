import { prisma, type Convenio, StatusPendencia } from '@spd/db';
import type {
  ConvenioFilters,
  ConvenioRepository,
  ConvenioLite
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
  etapas: true,
  emendas: true,
  financeiroContas: true,
  contratos: {
    include: {
      medicoes: { orderBy: { numeroMedicao: 'asc' as const } }
    }
  },
  pendencias: {
    where: { status: { in: [StatusPendencia.ABERTA, StatusPendencia.EM_ANDAMENTO] } },
    orderBy: { prioridade: 'asc' as const }
  },
  aditivos: { orderBy: { numeroAditivo: 'asc' as const } }
};

export class PrismaConvenioRepository implements ConvenioRepository {
  // Método otimizado para listagem (sem relacionamentos pesados)
  async listLite(filters?: ConvenioFilters): Promise<ConvenioLite[]> {
    const result = await prisma.convenio.findMany({
      where: {
        status: filters?.status as Convenio['status'],
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
      }
    });
    
    // Converter Decimal para number
    return result.map(conv => ({
      ...conv,
      valorGlobal: Number(conv.valorGlobal)
    }));
  }

  async list(filters?: ConvenioFilters): Promise<Convenio[]> {
    return prisma.convenio.findMany({
      where: {
        status: filters?.status as Convenio['status'],
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
