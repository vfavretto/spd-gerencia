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
      porStatus,
      pendenciasAbertas,
      pendenciasEmAndamento,
      pendenciasVencidas,
      totalPendencias,
      contratosRaw,
      medicoes,
      conveniosVencendo,
      conveniosParaCalculo
    ] = await Promise.all([
      // Agrupamento por status
      prisma.convenio.groupBy({
        by: ['status'],
        _count: { status: true }
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
      // Todos os convênios com dados para cálculo de valores vigentes
      prisma.convenio.findMany({
        select: {
          id: true,
          codigo: true,
          titulo: true,
          status: true,
          esfera: true,
          valorGlobal: true,
          valorRepasse: true,
          valorContrapartida: true,
          financeiroContas: {
            select: {
              ajusteRepasseVigente: true,
              ajusteContrapartidaVigente: true
            }
          },
          aditivos: {
            where: { contratoId: null },
            select: {
              tipoAditivo: true,
              valorAcrescimo: true,
              valorSupressao: true
            }
          },
          contratos: {
            select: {
              valorContrato: true,
              medicoes: { select: { valorMedido: true } }
            }
          }
        },
        orderBy: { valorGlobal: 'desc' }
      })
    ]);

    // Calcular valores vigentes por convênio
    let somaRepassesVigente = 0;
    let somaContrapartidasVigente = 0;
    let valorGlobalTotalVigente = 0;
    const porEsferaMap = new Map<string | null, { total: number; quantidade: number }>();

    for (const conv of conveniosParaCalculo) {
      const repasseOriginal = Number(conv.valorRepasse ?? 0);
      const contrapartidaOriginal = Number(conv.valorContrapartida ?? 0);
      const ajusteRepasse = Number(conv.financeiroContas?.ajusteRepasseVigente ?? 0);
      const ajusteContrapartida = Number(conv.financeiroContas?.ajusteContrapartidaVigente ?? 0);

      let totalAcrescimos = 0;
      let totalSupressoes = 0;
      for (const aditivo of conv.aditivos) {
        if (['VALOR', 'PRAZO_E_VALOR', 'ACRESCIMO'].includes(aditivo.tipoAditivo)) {
          totalAcrescimos += Number(aditivo.valorAcrescimo ?? 0);
        }
        if (['VALOR', 'PRAZO_E_VALOR', 'SUPRESSAO'].includes(aditivo.tipoAditivo)) {
          totalSupressoes += Number(aditivo.valorSupressao ?? 0);
        }
      }

      const repasseVigente = repasseOriginal + totalAcrescimos - totalSupressoes + ajusteRepasse;
      const contrapartidaVigente = contrapartidaOriginal + ajusteContrapartida;
      const globalVigente = repasseVigente + contrapartidaVigente;

      somaRepassesVigente += repasseVigente;
      somaContrapartidasVigente += contrapartidaVigente;
      valorGlobalTotalVigente += globalVigente;

      // Agrupar por esfera
      const esfera = conv.esfera;
      const existing = porEsferaMap.get(esfera) ?? { total: 0, quantidade: 0 };
      porEsferaMap.set(esfera, {
        total: existing.total + globalVigente,
        quantidade: existing.quantidade + 1
      });
    }

    // Calcular valores de contratos
    const valorTotalContratado = contratosRaw.reduce(
      (sum, c) => sum + Number(c.valorContrato ?? 0),
      0
    );
    const contratosEmExecucao = contratosRaw.filter(
      (c) => c.situacao?.toLowerCase().includes('execu') || c._count.medicoes > 0
    ).length;
    const contratosConcluidos = contratosRaw.filter(
      (c) => c.situacao?.toLowerCase().includes('conclu')
    ).length;

    // Valores de execução
    const valorTotalMedido = Number(medicoes._sum.valorMedido ?? 0);
    const valorTotalPago = Number(medicoes._sum.valorPago ?? 0);

    // Top 5 convênios com percentual vigente
    const topConvenios = conveniosParaCalculo.slice(0, 5).map((c) => {
      const totalMedido = c.contratos.reduce(
        (sum, contrato) =>
          sum +
          contrato.medicoes.reduce((s, m) => s + Number(m.valorMedido ?? 0), 0),
        0
      );

      // Calcular valor global vigente para este convênio
      const repasseOrig = Number(c.valorRepasse ?? 0);
      const ajR = Number(c.financeiroContas?.ajusteRepasseVigente ?? 0);
      const ajC = Number(c.financeiroContas?.ajusteContrapartidaVigente ?? 0);
      let acr = 0;
      let sup = 0;
      for (const a of c.aditivos) {
        if (['VALOR', 'PRAZO_E_VALOR', 'ACRESCIMO'].includes(a.tipoAditivo)) acr += Number(a.valorAcrescimo ?? 0);
        if (['VALOR', 'PRAZO_E_VALOR', 'SUPRESSAO'].includes(a.tipoAditivo)) sup += Number(a.valorSupressao ?? 0);
      }
      const globalVigente = (repasseOrig + acr - sup + ajR) + (Number(c.valorContrapartida ?? 0) + ajC);

      const percentualExecutado =
        globalVigente > 0
          ? (totalMedido / globalVigente) * 100
          : 0;

      return {
        id: c.id,
        codigo: c.codigo,
        titulo: c.titulo,
        valorGlobal: globalVigente,
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
      totalPorEsfera: Array.from(porEsferaMap.entries()).map(([esfera, data]) => ({
        esfera,
        total: data.total,
        quantidade: data.quantidade
      })),
      conveniosPorStatus: porStatus.map((item) => ({
        status: item.status,
        total: item._count.status
      })),
      somaRepasses: somaRepassesVigente,
      somaContrapartidas: somaContrapartidasVigente,
      valorGlobalTotal: valorGlobalTotalVigente,

      execucao: {
        valorTotalContratado,
        valorTotalMedido,
        valorTotalPago,
        percentualMedido:
          valorGlobalTotalVigente > 0
            ? Math.round((valorTotalMedido / valorGlobalTotalVigente) * 1000) / 10
            : 0,
        percentualPago:
          valorGlobalTotalVigente > 0
            ? Math.round((valorTotalPago / valorGlobalTotalVigente) * 1000) / 10
            : 0
      },

      pendencias: {
        abertas: pendenciasAbertas,
        emAndamento: pendenciasEmAndamento,
        vencidasHoje: pendenciasVencidas,
        total: totalPendencias
      },

      contratos: {
        total: contratosRaw.length,
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
