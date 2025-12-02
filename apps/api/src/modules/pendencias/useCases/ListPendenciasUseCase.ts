import type { Pendencia } from '@spd/db';
import type { PendenciaFilters, PendenciaRepository } from '../repositories/PendenciaRepository';

export class ListPendenciasUseCase {
  constructor(private readonly repository: PendenciaRepository) {}

  execute(convenioId: number, filters?: PendenciaFilters): Promise<Pendencia[]> {
    return this.repository.listByConvenio(convenioId, filters);
  }
}

