import type { ContratoExecucao } from '@spd/db';
import type { ContratoRepository } from '../repositories/ContratoRepository';

export class ListContratosUseCase {
  constructor(private readonly repository: ContratoRepository) {}

  execute(convenioId: number): Promise<ContratoExecucao[]> {
    return this.repository.listByConvenio(convenioId);
  }
}

