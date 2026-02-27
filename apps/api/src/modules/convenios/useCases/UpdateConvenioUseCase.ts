import type { IConvenio } from '@spd/db';
import { AppError } from '@shared/errors/AppError';
import type { UpdateConvenioDTO } from '../dto/ConvenioDTO';
import type { ConvenioRepository } from '../repositories/ConvenioRepository';

export class UpdateConvenioUseCase {
  constructor(private readonly repository: ConvenioRepository) {}

  async execute(id: string, data: UpdateConvenioDTO): Promise<IConvenio> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new AppError('Convênio não encontrado', 404);
    }

    // Permite a transição para APROVADO ao registrar assinatura
    // (dataAssinatura sendo definida pela primeira vez).
    const isRegistrandoAssinatura =
      data.dataAssinatura && !existing.dataAssinatura;

    if (isRegistrandoAssinatura && data.status === 'APROVADO') {
      // Mantém o status APROVADO no payload
      return this.repository.update(id, data);
    }

    // Para todos os outros casos, o campo status é ignorado.
    // Status é gerenciado automaticamente pelo ConvenioStatusService
    // ou por ações explícitas (concluir / cancelar).
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { status: _status, ...safeData } = data;

    return this.repository.update(id, safeData);
  }
}
