import type { NotaEmpenhoRepository } from '../repositories/NotaEmpenhoRepository';

export class DeleteNotaEmpenhoUseCase {
  constructor(private readonly repository: NotaEmpenhoRepository) {}

  execute(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}
