import type { ConvenioFilters, ConvenioLite, ConvenioRepository } from '../repositories/ConvenioRepository';

export class ListConveniosLiteUseCase {
  constructor(private repository: ConvenioRepository) {}

  async execute(filters?: ConvenioFilters): Promise<ConvenioLite[]> {
    return this.repository.listLite(filters);
  }
}

