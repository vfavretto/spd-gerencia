import type { EventoAgenda } from '@spd/db';
import type { EventoRepository } from '../repositories/EventoRepository';

export class ListEventosUseCase {
  constructor(private readonly repository: EventoRepository) {}

  execute(): Promise<EventoAgenda[]> {
    return this.repository.list();
  }
}
