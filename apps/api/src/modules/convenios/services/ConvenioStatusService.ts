import { ConvenioStatus, StatusPendencia, type IConvenio } from '@spd/db';
import type { ConvenioRepository } from '../repositories/ConvenioRepository';

/**
 * Serviço responsável por derivar automaticamente o status de um convênio
 * com base no estado atual de suas pendências e contratos.
 *
 * Status terminais (CONCLUIDO/CANCELADO) não são recalculados — eles só
 * mudam via ações explícitas (ConcluirConvenioUseCase / CancelarConvenioUseCase).
 */
export class ConvenioStatusService {
  constructor(private readonly repository: ConvenioRepository) {}

  /**
   * Calcula o status esperado de um convênio com base nos dados atuais.
   * Retorna o status derivado sem alterar o banco.
   */
  static deriveStatus(convenio: IConvenio): ConvenioStatus {
    // Status terminais nunca são recalculados
    if (
      convenio.status === ConvenioStatus.CONCLUIDO ||
      convenio.status === ConvenioStatus.CANCELADO
    ) {
      return convenio.status;
    }

    const temPendenciaAtiva = (convenio.pendencias ?? []).some(
      (p) =>
        p.status === StatusPendencia.ABERTA ||
        p.status === StatusPendencia.EM_ANDAMENTO
    );
    const temContrato = (convenio.contratos ?? []).length > 0;

    // Fase pós-assinatura (APROVADO ou EM_EXECUCAO)
    if (
      convenio.status === ConvenioStatus.APROVADO ||
      convenio.status === ConvenioStatus.EM_EXECUCAO
    ) {
      return temContrato
        ? ConvenioStatus.EM_EXECUCAO
        : ConvenioStatus.APROVADO;
    }

    // Fase pré-assinatura (RASCUNHO ou EM_ANALISE)
    return temPendenciaAtiva
      ? ConvenioStatus.EM_ANALISE
      : ConvenioStatus.RASCUNHO;
  }

  /**
   * Recalcula e persiste o status de um convênio se necessário.
   * Retorna o convênio atualizado (ou o original se nada mudou).
   */
  async recalculate(convenioId: string): Promise<IConvenio | null> {
    const convenio = await this.repository.findById(convenioId);
    if (!convenio) return null;

    const newStatus = ConvenioStatusService.deriveStatus(convenio);

    if (newStatus !== convenio.status) {
      return this.repository.update(convenioId, { status: newStatus });
    }

    return convenio;
  }
}
