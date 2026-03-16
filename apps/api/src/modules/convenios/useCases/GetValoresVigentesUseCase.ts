import type { IConvenio, IAditivo, IContratoExecucao } from '@spd/db';
import { AppError } from '@shared/errors/AppError';
import type { ConvenioRepository } from '../repositories/ConvenioRepository';

export interface ValoresVigentes {

  valorGlobal: number;
  valorRepasseOriginal: number;
  valorContrapartidaOriginal: number;
  

  valorRepasseVigente: number;
  valorContrapartidaVigente: number;
  valorGlobalVigente: number;
  

  totalAcrescimos: number;
  totalSupressoes: number;
  

  valorTotalContratado: number;
  valorTotalMedido: number;
  valorTotalPago: number;
  

  saldoRepasse: number;
  saldoContrapartida: number;
  saldoAContratar: number;
  saldoConvenio: number;
  saldoExecucao: number;
  totalCPExclusiva: number;
  

  percentualExecutado: number;
  percentualPago: number;
  

  dataUltimaMedicao: Date | null;
  diasSemMedicao: number | null;
}

export class GetValoresVigentesUseCase {
  constructor(private readonly repository: ConvenioRepository) {}

  async execute(id: string): Promise<ValoresVigentes> {
    const convenio = await this.repository.findById(id);
    
    if (!convenio) {
      throw new AppError('Convênio não encontrado', 404);
    }
    
    return this.calcularValoresVigentes(convenio);
  }

  private calcularValoresVigentes(convenio: IConvenio): ValoresVigentes {
    const valorGlobal = Number(convenio.valorGlobal) || 0;
    const valorRepasseOriginal = Number(convenio.valorRepasse) || 0;
    const valorContrapartidaOriginal = Number(convenio.valorContrapartida) || 0;
    const ajusteRepasseVigente = Number(convenio.financeiroContas?.ajusteRepasseVigente) || 0;
    const ajusteContrapartidaVigente = Number(convenio.financeiroContas?.ajusteContrapartidaVigente) || 0;
    

    const aditivos = (convenio.aditivos || []).filter((aditivo) => !aditivo.contratoId);
    const { totalAcrescimos, totalSupressoes } = this.calcularTotaisAditivos(aditivos);
    

    const valorRepasseVigenteBase = valorRepasseOriginal + totalAcrescimos - totalSupressoes;
    const valorContrapartidaVigenteBase = valorContrapartidaOriginal; // Contrapartida geralmente não muda por aditivo


    const valorRepasseVigente = valorRepasseVigenteBase + ajusteRepasseVigente;
    const valorContrapartidaVigente = valorContrapartidaVigenteBase + ajusteContrapartidaVigente;
    const valorGlobalVigente = valorRepasseVigente + valorContrapartidaVigente;
    

    const contratos = convenio.contratos || [];
    const { valorTotalContratado, valorTotalMedido, valorTotalPago, totalCPExclusiva, dataUltimaMedicao } = 
      this.calcularValoresExecutados(contratos);
    

    const saldoRepasse = valorRepasseVigente - valorTotalPago;
    const saldoContrapartida = valorContrapartidaVigente;
    const saldoAContratar = valorGlobalVigente - valorTotalContratado;
    // Saldo do convênio: valor global - pago (limitado a 100% do valor)
    const saldoConvenio = Math.max(0, valorGlobalVigente - valorTotalPago);
    // Saldo de execução: inclui CP Exclusiva para cobrir excedentes
    const saldoExecucao = valorGlobalVigente + totalCPExclusiva - valorTotalContratado;
    

    const percentualExecutado = valorGlobalVigente > 0 
      ? (valorTotalMedido / valorGlobalVigente) * 100 
      : 0;
    const percentualPago = valorGlobalVigente > 0 
      ? (valorTotalPago / valorGlobalVigente) * 100 
      : 0;
    

    const diasSemMedicao = dataUltimaMedicao 
      ? Math.floor((Date.now() - dataUltimaMedicao.getTime()) / (1000 * 60 * 60 * 24))
      : null;
    
    return {
      valorGlobal,
      valorRepasseOriginal,
      valorContrapartidaOriginal,
      valorRepasseVigente,
      valorContrapartidaVigente,
      valorGlobalVigente,
      totalAcrescimos,
      totalSupressoes,
      valorTotalContratado,
      valorTotalMedido,
      valorTotalPago,
      saldoRepasse,
      saldoContrapartida,
      saldoAContratar,
      saldoConvenio,
      saldoExecucao,
      totalCPExclusiva,
      percentualExecutado: Math.round(percentualExecutado * 100) / 100,
      percentualPago: Math.round(percentualPago * 100) / 100,
      dataUltimaMedicao,
      diasSemMedicao
    };
  }
  
  private calcularTotaisAditivos(aditivos: IAditivo[]): { totalAcrescimos: number; totalSupressoes: number } {
    let totalAcrescimos = 0;
    let totalSupressoes = 0;
    
    for (const aditivo of aditivos) {

      if (['VALOR', 'PRAZO_E_VALOR', 'ACRESCIMO'].includes(aditivo.tipoAditivo)) {
        totalAcrescimos += Number(aditivo.valorAcrescimo) || 0;
      }
      if (['VALOR', 'PRAZO_E_VALOR', 'SUPRESSAO'].includes(aditivo.tipoAditivo)) {
        totalSupressoes += Number(aditivo.valorSupressao) || 0;
      }
    }
    
    return { totalAcrescimos, totalSupressoes };
  }
  
  private calcularValoresExecutados(contratos: IContratoExecucao[]): {
    valorTotalContratado: number;
    valorTotalMedido: number;
    valorTotalPago: number;
    totalCPExclusiva: number;
    dataUltimaMedicao: Date | null;
  } {
    let valorTotalContratado = 0;
    let valorTotalMedido = 0;
    let valorTotalPago = 0;
    let totalCPExclusiva = 0;
    let dataUltimaMedicao: Date | null = null;
    
    for (const contrato of contratos) {
      valorTotalContratado += Number(contrato.valorContrato) || 0;
      totalCPExclusiva += Number(contrato.valorCPExclusiva) || 0;
      
      const medicoes = contrato.medicoes || [];
      for (const medicao of medicoes) {
        valorTotalMedido += Number(medicao.valorMedido) || 0;
        valorTotalPago += Number(medicao.valorPago) || 0;
        
        const dataMedicao = new Date(medicao.dataMedicao);
        if (!dataUltimaMedicao || dataMedicao > dataUltimaMedicao) {
          dataUltimaMedicao = dataMedicao;
        }
      }
    }
    
    return { valorTotalContratado, valorTotalMedido, valorTotalPago, totalCPExclusiva, dataUltimaMedicao };
  }
}
