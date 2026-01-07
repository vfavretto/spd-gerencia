import type { IEventoAgenda } from '@spd/db';
import type { CreateEventoDTO } from '../dto/EventoDTO';
import type { EventoRepository } from '../repositories/EventoRepository';

export class CreateEventoUseCase {
  constructor(private readonly repository: EventoRepository) {}

  execute(data: CreateEventoDTO): Promise<IEventoAgenda> {
    return this.repository.create(data);
  }
}
