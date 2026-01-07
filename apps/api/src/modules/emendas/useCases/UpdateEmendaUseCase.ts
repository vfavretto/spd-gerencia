import type { IEmendaParlamentar } from '@spd/db';
import type { UpdateEmendaDTO } from '../dto/EmendaDTO';
import type { EmendaRepository } from '../repositories/EmendaRepository';

export class UpdateEmendaUseCase {
  constructor(private readonly repository: EmendaRepository) {}

  execute(id: string, data: UpdateEmendaDTO): Promise<IEmendaParlamentar> {
    return this.repository.update(id, data);
  }
}
