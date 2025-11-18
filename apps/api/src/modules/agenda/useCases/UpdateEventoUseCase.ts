import type { EventoAgenda } from '@spd/db';
import { AppError } from '@shared/errors/AppError';
import type { UpdateEventoDTO } from '../dto/EventoDTO';
import type { EventoRepository } from '../repositories/EventoRepository';

export class UpdateEventoUseCase {
  constructor(private readonly repository: EventoRepository) {}

  async execute(id: number, data: UpdateEventoDTO): Promise<EventoAgenda> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new AppError('Evento não encontrado', 404);
    }
    return this.repository.update(id, data);
  }
}
