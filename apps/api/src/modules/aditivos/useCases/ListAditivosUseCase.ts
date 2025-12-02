import type { Aditivo } from '@spd/db';
import type { AditivoRepository } from '../repositories/AditivoRepository';

export class ListAditivosUseCase {
  constructor(private readonly repository: AditivoRepository) {}

  execute(convenioId: number): Promise<Aditivo[]> {
    return this.repository.listByConvenio(convenioId);
  }
}

