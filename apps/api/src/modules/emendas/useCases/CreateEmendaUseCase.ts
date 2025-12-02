import type { EmendaParlamentar } from '@spd/db';
import type { CreateEmendaDTO } from '../dto/EmendaDTO';
import type { EmendaRepository } from '../repositories/EmendaRepository';

export class CreateEmendaUseCase {
  constructor(private readonly repository: EmendaRepository) {}

  execute(data: CreateEmendaDTO): Promise<EmendaParlamentar> {
    return this.repository.create(data);
  }
}

