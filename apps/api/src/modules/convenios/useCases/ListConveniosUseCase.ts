import type { IConvenio } from '@spd/db';
import type {
  ConvenioFilters,
  ConvenioRepository
} from '../repositories/ConvenioRepository';

export class ListConveniosUseCase {
  constructor(private readonly repository: ConvenioRepository) {}

  execute(filters?: ConvenioFilters): Promise<IConvenio[]> {
    return this.repository.list(filters);
  }
}
