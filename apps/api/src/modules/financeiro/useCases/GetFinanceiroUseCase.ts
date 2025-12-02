import type { FinanceiroContas } from '@spd/db';
import type { FinanceiroRepository } from '../repositories/FinanceiroRepository';

export class GetFinanceiroUseCase {
  constructor(private readonly repository: FinanceiroRepository) {}

  execute(convenioId: number): Promise<FinanceiroContas | null> {
    return this.repository.findByConvenio(convenioId);
  }
}

