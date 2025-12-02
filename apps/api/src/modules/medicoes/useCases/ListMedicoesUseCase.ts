import type { Medicao } from '@spd/db';
import type { MedicaoRepository } from '../repositories/MedicaoRepository';

export class ListMedicoesUseCase {
  constructor(private readonly repository: MedicaoRepository) {}

  execute(contratoId: number): Promise<Medicao[]> {
    return this.repository.listByContrato(contratoId);
  }
}

