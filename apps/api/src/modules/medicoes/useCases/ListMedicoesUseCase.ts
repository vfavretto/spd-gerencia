import type { IMedicao } from '@spd/db';
import type { MedicaoRepository } from '../repositories/MedicaoRepository';

export class ListMedicoesUseCase {
  constructor(private readonly repository: MedicaoRepository) {}

  execute(contratoId: string): Promise<IMedicao[]> {
    return this.repository.listByContrato(contratoId);
  }
}
