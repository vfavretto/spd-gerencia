import type { Convenio } from '@spd/db';
import type {
  ConvenioFilters,
  ConvenioRepository
} from '../repositories/ConvenioRepository';

export class ListConveniosUseCase {
  constructor(private readonly repository: ConvenioRepository) {}

  execute(filters?: ConvenioFilters): Promise<Convenio[]> {
    return this.repository.list(filters);
  }
}
