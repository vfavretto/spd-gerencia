import type { UpdatePendenciaDTO } from '../dto/PendenciaDTO';
import type { PendenciaRepository } from '../repositories/PendenciaRepository';
import { AppError } from '@shared/errors/AppError';

export class UpdatePendenciaUseCase {
  constructor(private repository: PendenciaRepository) {}

  async execute(id: string, data: UpdatePendenciaDTO) {
    // Verificar se existe
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new AppError('Pendência não encontrada', 404);
    }
    return this.repository.update(id, data);
  }
}
