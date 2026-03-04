import { ConvenioStatus, type IConvenio } from '@spd/db';
import { AppError } from '@shared/errors/AppError';
import type { ConvenioRepository } from '../repositories/ConvenioRepository';

export class CancelarConvenioUseCase {
  constructor(private readonly repository: ConvenioRepository) {}

  async execute(id: string): Promise<IConvenio> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new AppError('Convênio não encontrado', 404);
    }

    if (
      existing.status === ConvenioStatus.CONCLUIDO ||
      existing.status === ConvenioStatus.CANCELADO
    ) {
      throw new AppError(
        `Não é possível cancelar: convênio já está ${existing.status === ConvenioStatus.CONCLUIDO ? 'concluído' : 'cancelado'}.`,
        400
      );
    }

    return this.repository.update(id, {
      status: ConvenioStatus.CANCELADO
    });
  }
}
