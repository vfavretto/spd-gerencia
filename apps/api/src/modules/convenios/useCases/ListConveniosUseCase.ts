import type { IConvenio } from '@spd/db';
import type {
  ConvenioFilters,
  ConvenioRepository,
  PaginatedResult
} from '../repositories/ConvenioRepository';

export class ListConveniosUseCase {
  constructor(private readonly repository: ConvenioRepository) {}

  execute(filters?: ConvenioFilters, page?: number, limit?: number): Promise<PaginatedResult<IConvenio>> {
    return this.repository.list(filters, page, limit);
  }
}
