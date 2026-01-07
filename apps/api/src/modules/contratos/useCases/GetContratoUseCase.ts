import type { IContratoExecucao } from '@spd/db';
import type { ContratoRepository } from '../repositories/ContratoRepository';
import { AppError } from '@shared/errors/AppError';

export class GetContratoUseCase {
  constructor(private readonly repository: ContratoRepository) {}

  async execute(id: string): Promise<IContratoExecucao> {
    const contrato = await this.repository.findByIdWithMedicoes(id);
    if (!contrato) {
      throw new AppError('Contrato não encontrado', 404);
    }
    return contrato;
  }
}
