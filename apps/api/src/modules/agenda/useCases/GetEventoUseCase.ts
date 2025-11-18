import type { EventoAgenda } from '@spd/db';
import { AppError } from '@shared/errors/AppError';
import type { EventoRepository } from '../repositories/EventoRepository';

export class GetEventoUseCase {
  constructor(private readonly repository: EventoRepository) {}

  async execute(id: number): Promise<EventoAgenda> {
    const evento = await this.repository.findById(id);
    if (!evento) {
      throw new AppError('Evento não encontrado', 404);
    }
    return evento;
  }
}
