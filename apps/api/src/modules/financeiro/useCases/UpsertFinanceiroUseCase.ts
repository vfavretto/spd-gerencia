import type { IFinanceiroContas } from '@spd/db';
import type { CreateFinanceiroDTO } from '../dto/FinanceiroDTO';
import type { FinanceiroRepository } from '../repositories/FinanceiroRepository';

export class UpsertFinanceiroUseCase {
  constructor(private readonly repository: FinanceiroRepository) {}

  execute(
    convenioId: string,
    data: Omit<CreateFinanceiroDTO, 'convenioId'>
  ): Promise<IFinanceiroContas> {
    return this.repository.upsertByConvenio(convenioId, data);
  }
}
