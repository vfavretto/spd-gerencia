import type { FinanceiroRepository } from '../repositories/FinanceiroRepository';

export class DeleteFinanceiroUseCase {
  constructor(private readonly repository: FinanceiroRepository) {}

  execute(id: number): Promise<void> {
    return this.repository.delete(id);
  }
}

