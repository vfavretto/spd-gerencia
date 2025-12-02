import type { FinanceiroContas } from '@spd/db';
import type { CreateFinanceiroDTO } from '../dto/FinanceiroDTO';
import type { FinanceiroRepository } from '../repositories/FinanceiroRepository';

export class UpsertFinanceiroUseCase {
  constructor(private readonly repository: FinanceiroRepository) {}

  execute(
    convenioId: number,
    data: Omit<CreateFinanceiroDTO, 'convenioId'>
  ): Promise<FinanceiroContas> {
    return this.repository.upsertByConvenio(convenioId, data);
  }
}

