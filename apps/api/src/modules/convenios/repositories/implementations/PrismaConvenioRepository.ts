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

  private mapToDomain(
    conv: Prisma.ConvenioGetPayload<{ include: typeof includeRelations }>
  ): IConvenio {
    return {
      ...conv,
      // Valores financeiros do convênio
      valorGlobal: conv.valorGlobal.toNumber(),
      valorRepasse: conv.valorRepasse ? conv.valorRepasse.toNumber() : null,
      valorContrapartida: conv.valorContrapartida ? conv.valorContrapartida.toNumber() : null,
      etapas: [],
      anexos: [],
      // Emendas parlamentares
      emendas: (conv.emendas ?? []).map((e) => ({
        ...e,
        valorIndicado: e.valorIndicado ? e.valorIndicado.toNumber() : e.valorIndicado
      })),
      // Financeiro contas
      financeiroContas: conv.financeiroContas
        ? {
            ...conv.financeiroContas,
            valorLiberadoTotal: conv.financeiroContas.valorLiberadoTotal ? conv.financeiroContas.valorLiberadoTotal.toNumber() : conv.financeiroContas.valorLiberadoTotal,
            saldoRendimentos: conv.financeiroContas.saldoRendimentos ? conv.financeiroContas.saldoRendimentos.toNumber() : conv.financeiroContas.saldoRendimentos,
            valorCPExclusiva: conv.financeiroContas.valorCPExclusiva ? conv.financeiroContas.valorCPExclusiva.toNumber() : conv.financeiroContas.valorCPExclusiva,
            ajusteRepasseVigente: conv.financeiroContas.ajusteRepasseVigente ? conv.financeiroContas.ajusteRepasseVigente.toNumber() : conv.financeiroContas.ajusteRepasseVigente,
            ajusteContrapartidaVigente: conv.financeiroContas.ajusteContrapartidaVigente ? conv.financeiroContas.ajusteContrapartidaVigente.toNumber() : conv.financeiroContas.ajusteContrapartidaVigente,
          }
        : null,
      // Contratos com medições
      contratos: (conv.contratos ?? []).map((c) => ({
        ...c,
        valorContrato: c.valorContrato ? c.valorContrato.toNumber() : c.valorContrato,
        valorExecutado: c.valorExecutado ? c.valorExecutado.toNumber() : c.valorExecutado,
        medicoes: (c.medicoes ?? []).map((m) => ({
          ...m,
          percentualFisico: m.percentualFisico ? m.percentualFisico.toNumber() : m.percentualFisico,
          valorMedido: m.valorMedido.toNumber(),
          valorPago: m.valorPago ? m.valorPago.toNumber() : m.valorPago,
        })),
      })),
      // Aditivos
      aditivos: (conv.aditivos ?? []).map((a) => ({
        ...a,
        valorAcrescimo: a.valorAcrescimo ? a.valorAcrescimo.toNumber() : a.valorAcrescimo,
        valorSupressao: a.valorSupressao ? a.valorSupressao.toNumber() : a.valorSupressao,
      })),
      // Fichas orçamentárias
      fichasOrcamentarias: (conv.fichasOrcamentarias ?? []).map((f) => ({
        ...f,
        valor: f.valor ? f.valor.toNumber() : f.valor,
      })),
      // Notas de empenho
      notasEmpenho: (conv.notasEmpenho ?? []).map((n) => ({
        ...n,
        valor: n.valor.toNumber(),
      })),
    } as IConvenio;
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
    await prisma.$transaction(async (tx) => {
      const contratos = await tx.contratoExecucao.findMany({
        where: { convenioId: id },
        select: { id: true }
      });

      const contratoIds = contratos.map((contrato) => contrato.id);

      if (contratoIds.length > 0) {
        await tx.medicao.deleteMany({
          where: {
            contratoId: { in: contratoIds }
          }
        });
      }

      await tx.aditivo.deleteMany({ where: { convenioId: id } });

      if (contratoIds.length > 0) {
        await tx.contratoExecucao.deleteMany({
          where: { id: { in: contratoIds } }
        });
      }

      await tx.pendencia.deleteMany({ where: { convenioId: id } });
      await tx.fichaOrcamentaria.deleteMany({ where: { convenioId: id } });
      await tx.notaEmpenho.deleteMany({ where: { convenioId: id } });
      await tx.emendaParlamentar.deleteMany({ where: { convenioId: id } });
      await tx.financeiroContas.deleteMany({ where: { convenioId: id } });
      await tx.convenioAnexo.deleteMany({ where: { convenioId: id } });
      await tx.convenioSnapshot.deleteMany({ where: { convenioId: id } });

      // Em alguns ambientes o relacionamento pode estar com RESTRICT;
      // limpar vínculo evita bloqueio por FK opcional.
      await tx.eventoAgenda.updateMany({
        where: { convenioId: id },
        data: { convenioId: null }
      });

      await tx.convenio.delete({ where: { id } });
    });
  }
}
