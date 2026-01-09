import type { FichaOrcamentariaRepository } from '../repositories/FichaOrcamentariaRepository';

export class DeleteFichaOrcamentariaUseCase {
  constructor(private readonly repository: FichaOrcamentariaRepository) {}

  execute(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}
