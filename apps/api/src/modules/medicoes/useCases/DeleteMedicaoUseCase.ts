import type { MedicaoRepository } from '../repositories/MedicaoRepository';

export class DeleteMedicaoUseCase {
  constructor(private readonly repository: MedicaoRepository) {}

  execute(id: number): Promise<void> {
    return this.repository.delete(id);
  }
}

