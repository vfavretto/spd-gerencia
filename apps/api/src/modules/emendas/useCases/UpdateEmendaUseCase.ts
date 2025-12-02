import type { EmendaParlamentar } from '@spd/db';
import type { UpdateEmendaDTO } from '../dto/EmendaDTO';
import type { EmendaRepository } from '../repositories/EmendaRepository';

export class UpdateEmendaUseCase {
  constructor(private readonly repository: EmendaRepository) {}

  execute(id: number, data: UpdateEmendaDTO): Promise<EmendaParlamentar> {
    return this.repository.update(id, data);
  }
}

