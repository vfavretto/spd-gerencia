import type { IFinanceiroContas } from '@spd/db';
import type { FinanceiroRepository } from '../repositories/FinanceiroRepository';

export class GetFinanceiroUseCase {
  constructor(private readonly repository: FinanceiroRepository) {}

  execute(convenioId: string): Promise<IFinanceiroContas | null> {
    return this.repository.findByConvenio(convenioId);
  }
}
