import type { PendenciaFilters, PendenciaRepository } from '../repositories/PendenciaRepository';

export class ListPendenciasUseCase {
  constructor(private repository: PendenciaRepository) {}

  async execute(convenioId: number, filters?: PendenciaFilters) {
    return this.repository.listByConvenio(convenioId, filters);
  }
}

