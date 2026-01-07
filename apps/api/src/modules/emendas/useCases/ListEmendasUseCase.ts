import type { IEmendaParlamentar } from '@spd/db';
import type { EmendaRepository } from '../repositories/EmendaRepository';

export class ListEmendasUseCase {
  constructor(private readonly repository: EmendaRepository) {}

  execute(convenioId: string): Promise<IEmendaParlamentar[]> {
    return this.repository.listByConvenio(convenioId);
  }
}
