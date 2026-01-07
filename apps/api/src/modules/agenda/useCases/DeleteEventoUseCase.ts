import { AppError } from '@shared/errors/AppError';
import type { EventoRepository } from '../repositories/EventoRepository';

export class DeleteEventoUseCase {
  constructor(private readonly repository: EventoRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new AppError('Evento não encontrado', 404);
    }
    await this.repository.delete(id);
  }
}
