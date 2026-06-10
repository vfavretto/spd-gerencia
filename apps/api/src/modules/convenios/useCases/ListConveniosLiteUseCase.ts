import type { ConvenioFilters, ConvenioLite, ConvenioRepository, PaginatedResult } from '../repositories/ConvenioRepository';

export class ListConveniosLiteUseCase {
  constructor(private repository: ConvenioRepository) {}

  async execute(filters?: ConvenioFilters, page?: number, limit?: number): Promise<PaginatedResult<ConvenioLite>> {
    return this.repository.listLite(filters, page, limit);
  }
}

