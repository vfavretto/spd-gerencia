import type { IEventoAgenda } from '@spd/db';
import type { EventoRepository } from '../repositories/EventoRepository';

export class ListEventosUseCase {
  constructor(private readonly repository: EventoRepository) {}

  execute(): Promise<IEventoAgenda[]> {
    return this.repository.list();
  }
}
