import { prisma } from '@spd/db';

export type DashboardResumo = {
  // Visão financeira
  totalPorEsfera: { esfera: string | null; total: number; quantidade: number }[];
  conveniosPorStatus: { status: string; total: number }[];
  somaRepasses: number;
  somaContrapartidas: number;
  valorGlobalTotal: number;
  
  // Execução
  execucao: {
    valorTotalContratado: number;
    valorTotalMedido: number;
    valorTotalPago: number;
    percentualMedido: number;
    percentualPago: number;
  };
  
  // Pendências
  pendencias: {
    abertas: number;
    emAndamento: number;
    vencidasHoje: number;
    total: number;
  };
  
  // Contratos
  contratos: {
    total: number;
    emExecucao: number;
    concluidos: number;
    valorTotal: number;
  };
  
  // Alertas
  alertas: {
    conveniosVencendo30Dias: number;
    conveniosSemMedicao60Dias: number;
    pendenciasAtrasadas: number;
    contratosSemMedicaoRecente: number;
  };
  
  // Top convênios por valor
  topConvenios: {
    id: string;
    codigo: string;
    titulo: string;
    valorGlobal: number;
    status: string;
    percentualExecutado: number;
  }[];
};

export class GetDashboardResumoUseCase {
  async execute(): Promise<DashboardResumo> {
    const hoje = new Date();
    const em30Dias = new Date(hoje);
    em30Dias.setDate(em30Dias.getDate() + 30);
    const ha60Dias = new Date(hoje);
    ha60Dias.setDate(ha60Dias.getDate() - 60);

    const [
      porEsfera,
      porStatus,
      totaisConvenio,
      pendenciasAbertas,
      pendenciasEmAndamento,
      pendenciasVencidas,
      totalPendencias,
      contratos,
      medicoes,
      conveniosVencendo,
      topConveniosRaw
    ] = await Promise.all([
      // Agrupamento por esfera
      prisma.convenio.groupBy({
        by: ['esfera'],
        _sum: { valorGlobal: true },
        _count: { id: true }
      }),
      // Agrupamento por status
      prisma.convenio.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      // Totais financeiros do convênio
      prisma.convenio.aggregate({
        _sum: {
          valorRepasse: true,
          valorContrapartida: true,
          valorGlobal: true
        }
      }),
      // Pendências abertas
      prisma.pendencia.count({ where: { status: 'ABERTA' } }),
      // Pendências em andamento
      prisma.pendencia.count({ where: { status: 'EM_ANDAMENTO' } }),
      // Pendências vencidas (prazo < hoje e não resolvidas)
      prisma.pendencia.count({
        where: {
          prazo: { lt: hoje },
          status: { in: ['ABERTA', 'EM_ANDAMENTO'] }
        }
      }),
      // Total pendências
      prisma.pendencia.count(),
      // Contratos
      prisma.contratoExecucao.findMany({
        select: {
          id: true,
          valorContrato: true,
          situacao: true,
          _count: { select: { medicoes: true } }
        }
      }),
      // Todas as medições
      prisma.medicao.aggregate({
        _sum: {
          valorMedido: true,
          valorPago: true
        }
      }),
      // Convênios vencendo em 30 dias
      prisma.convenio.count({
        where: {
          dataFimVigencia: { gte: hoje, lte: em30Dias },
          status: { notIn: ['CONCLUIDO', 'CANCELADO'] }
        }
      }),
      // Top 5 convênios por valor
      prisma.convenio.findMany({
        take: 5,
        orderBy: { valorGlobal: 'desc' },
        select: {
          id: true,
          codigo: true,
          titulo: true,
          valorGlobal: true,
          status: true,
          contratos: {
            select: {
              valorContrato: true,
              medicoes: { select: { valorMedido: true } }
            }
          }
        }
      })
    ]);

    // Calcular valores de contratos
    const valorTotalContratado = contratos.reduce(
      (sum, c) => sum + Number(c.valorContrato ?? 0),
      0
    );
    const contratosEmExecucao = contratos.filter(
      (c) => c.situacao?.toLowerCase().includes('execu') || c._count.medicoes > 0
    ).length;
    const contratosConcluidos = contratos.filter(
      (c) => c.situacao?.toLowerCase().includes('conclu')
    ).length;

    // Valores de execução
    const valorTotalMedido = Number(medicoes._sum.valorMedido ?? 0);
    const valorTotalPago = Number(medicoes._sum.valorPago ?? 0);
    const valorGlobalTotal = Number(totaisConvenio._sum.valorGlobal ?? 0);

    // Top convênios com percentual
    const topConvenios = topConveniosRaw.map((c) => {
      const totalMedido = c.contratos.reduce(
        (sum, contrato) =>
          sum +
          contrato.medicoes.reduce((s, m) => s + Number(m.valorMedido ?? 0), 0),
        0
      );
      const percentualExecutado =
        Number(c.valorGlobal) > 0
          ? (totalMedido / Number(c.valorGlobal)) * 100
          : 0;

      return {
        id: c.id,
        codigo: c.codigo,
        titulo: c.titulo,
        valorGlobal: Number(c.valorGlobal),
        status: c.status,
        percentualExecutado: Math.round(percentualExecutado * 10) / 10
      };
    });

    // Buscar convênios sem medição recente
    const conveniosSemMedicao = await prisma.convenio.count({
      where: {
        status: 'EM_EXECUCAO',
        contratos: {
          some: {
            medicoes: {
              none: { dataMedicao: { gte: ha60Dias } }
            }
          }
        }
      }
    });

    return {
      totalPorEsfera: porEsfera.map((item) => ({
        esfera: item.esfera,
        total: Number(item._sum.valorGlobal ?? 0),
        quantidade: item._count.id
      })),
      conveniosPorStatus: porStatus.map((item) => ({
        status: item.status,
        total: item._count.status
      })),
      somaRepasses: Number(totaisConvenio._sum.valorRepasse ?? 0),
      somaContrapartidas: Number(totaisConvenio._sum.valorContrapartida ?? 0),
      valorGlobalTotal,

      execucao: {
        valorTotalContratado,
        valorTotalMedido,
        valorTotalPago,
        percentualMedido:
          valorGlobalTotal > 0
            ? Math.round((valorTotalMedido / valorGlobalTotal) * 1000) / 10
            : 0,
        percentualPago:
          valorGlobalTotal > 0
            ? Math.round((valorTotalPago / valorGlobalTotal) * 1000) / 10
            : 0
      },

      pendencias: {
        abertas: pendenciasAbertas,
        emAndamento: pendenciasEmAndamento,
        vencidasHoje: pendenciasVencidas,
        total: totalPendencias
      },

      contratos: {
        total: contratos.length,
        emExecucao: contratosEmExecucao,
        concluidos: contratosConcluidos,
        valorTotal: valorTotalContratado
      },

      alertas: {
        conveniosVencendo30Dias: conveniosVencendo,
        conveniosSemMedicao60Dias: conveniosSemMedicao,
        pendenciasAtrasadas: pendenciasVencidas,
        contratosSemMedicaoRecente: conveniosSemMedicao
      },

      topConvenios
    };
  }
}
