import type { EmendaParlamentar } from '@spd/db';
import type { EmendaRepository } from '../repositories/EmendaRepository';

export class ListEmendasUseCase {
  constructor(private readonly repository: EmendaRepository) {}

  execute(convenioId: number): Promise<EmendaParlamentar[]> {
    return this.repository.listByConvenio(convenioId);
  }
}

