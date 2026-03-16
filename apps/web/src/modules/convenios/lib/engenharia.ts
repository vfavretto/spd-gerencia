import type { Convenio, ContratoExecucao, ValoresVigentes } from "@/modules/shared/types";

export const modalidadeLicitacaoLabels: Record<string, string> = {
  PREGAO: "Pregão",
  TOMADA_PRECOS: "Tomada de Preços",
  CONCORRENCIA: "Concorrência",
  DISPENSA: "Dispensa",
  INEXIGIBILIDADE: "Inexigibilidade"
};

export const getAditivosPorContrato = (convenio: Convenio) => {
  const mapa = new Map<string, NonNullable<Convenio["aditivos"]>>();
  const aditivos = convenio.aditivos ?? [];

  for (const aditivo of aditivos) {
    if (!aditivo.contratoId) continue;
    const lista = mapa.get(aditivo.contratoId) || [];
    lista.push(aditivo);
    mapa.set(aditivo.contratoId, lista);
  }

  return mapa;
};

export const getContratoMedidoTotal = (contrato: ContratoExecucao) =>
  contrato.medicoes?.reduce((acc, medicao) => acc + Number(medicao.valorMedido || 0), 0) || 0;

export const getContratoPercentualExecutado = (contrato: ContratoExecucao) => {
  const valorContrato = Number(contrato.valorContrato) || 0;
  const valorExecutado = getContratoMedidoTotal(contrato);

  return valorContrato > 0 ? (valorExecutado / valorContrato) * 100 : 0;
};

export const getEngenhariaValoresFinanceiros = (
  convenio: Convenio,
  valoresVigentes?: ValoresVigentes
) => {
  const ajusteRepasse = Number(convenio.financeiroContas?.ajusteRepasseVigente) || 0;
  const ajusteContrapartida = Number(convenio.financeiroContas?.ajusteContrapartidaVigente) || 0;
  const repasseAtual =
    valoresVigentes?.valorRepasseVigente ?? (Number(convenio.valorRepasse) || 0);
  const contrapartidaAtual =
    valoresVigentes?.valorContrapartidaVigente ?? (Number(convenio.valorContrapartida) || 0);

  return {
    repasseAtual,
    contrapartidaAtual,
    repasseBase: repasseAtual - ajusteRepasse,
    contrapartidaBase: contrapartidaAtual - ajusteContrapartida
  };
};
