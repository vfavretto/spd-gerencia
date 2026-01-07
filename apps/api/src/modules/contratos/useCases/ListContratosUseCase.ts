import type { IContratoExecucao } from '@spd/db';
import type { ContratoRepository } from '../repositories/ContratoRepository';

export class ListContratosUseCase {
  constructor(private readonly repository: ContratoRepository) {}

  execute(convenioId: string): Promise<IContratoExecucao[]> {
    return this.repository.listByConvenio(convenioId);
  }
}
