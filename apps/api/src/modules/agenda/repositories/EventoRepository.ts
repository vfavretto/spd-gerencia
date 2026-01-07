import type { IEventoAgenda } from '@spd/db';
import type { CreateEventoDTO, UpdateEventoDTO } from '../dto/EventoDTO';

export interface EventoRepository {
  list(): Promise<IEventoAgenda[]>;
  findById(id: string): Promise<IEventoAgenda | null>;
  create(data: CreateEventoDTO): Promise<IEventoAgenda>;
  update(id: string, data: UpdateEventoDTO): Promise<IEventoAgenda>;
  delete(id: string): Promise<void>;
}
