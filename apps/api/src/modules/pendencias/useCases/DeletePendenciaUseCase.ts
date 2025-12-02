import type { PendenciaRepository } from '../repositories/PendenciaRepository';

export class DeletePendenciaUseCase {
  constructor(private readonly repository: PendenciaRepository) {}

  execute(id: number): Promise<void> {
    return this.repository.delete(id);
  }
}

