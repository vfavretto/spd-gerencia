import type { EventoAgenda } from '@spd/db';
import type { CreateEventoDTO, UpdateEventoDTO } from '../dto/EventoDTO';

export interface EventoRepository {
  list(): Promise<EventoAgenda[]>;
  findById(id: number): Promise<EventoAgenda | null>;
  create(data: CreateEventoDTO): Promise<EventoAgenda>;
  update(id: number, data: UpdateEventoDTO): Promise<EventoAgenda>;
  delete(id: number): Promise<void>;
}
