import type { EventoAgenda } from '@spd/db';
import type { CreateEventoDTO } from '../dto/EventoDTO';
import type { EventoRepository } from '../repositories/EventoRepository';

export class CreateEventoUseCase {
  constructor(private readonly repository: EventoRepository) {}

  execute(data: CreateEventoDTO): Promise<EventoAgenda> {
    return this.repository.create(data);
  }
}
