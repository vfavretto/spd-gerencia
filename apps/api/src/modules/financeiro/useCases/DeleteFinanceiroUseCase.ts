import type { FinanceiroRepository } from '../repositories/FinanceiroRepository';

export class DeleteFinanceiroUseCase {
  constructor(private readonly repository: FinanceiroRepository) {}

  execute(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}
