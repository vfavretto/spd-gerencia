import { AppError } from '@shared/errors/AppError';
import type { ComunicadoRepository } from '../repositories/ComunicadoRepository';

export class DeleteComunicadoUseCase {
  constructor(private readonly repository: ComunicadoRepository) {}

  async execute(id: number): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new AppError('Comunicado não encontrado', 404);
    }
    await this.repository.delete(id);
  }
}
