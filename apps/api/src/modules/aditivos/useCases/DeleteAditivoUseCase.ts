import type { AditivoRepository } from '../repositories/AditivoRepository';

export class DeleteAditivoUseCase {
  constructor(private readonly repository: AditivoRepository) {}

  execute(id: number): Promise<void> {
    return this.repository.delete(id);
  }
}

