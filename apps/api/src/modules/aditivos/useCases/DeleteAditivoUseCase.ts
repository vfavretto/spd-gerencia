import type { AditivoRepository } from '../repositories/AditivoRepository';

export class DeleteAditivoUseCase {
  constructor(private readonly repository: AditivoRepository) {}

  execute(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}

