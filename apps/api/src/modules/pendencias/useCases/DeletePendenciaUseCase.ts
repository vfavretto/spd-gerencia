import type { PendenciaRepository } from '../repositories/PendenciaRepository';
import { AppError } from '@shared/errors/AppError';

export class DeletePendenciaUseCase {
  constructor(private repository: PendenciaRepository) {}

  async execute(id: string) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new AppError('Pendência não encontrada', 404);
    }
    await this.repository.delete(id);
  }
}
