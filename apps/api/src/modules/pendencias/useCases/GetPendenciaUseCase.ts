import type { Pendencia } from '@spd/db';
import type { PendenciaRepository } from '../repositories/PendenciaRepository';
import { AppError } from '@shared/errors/AppError';

export class GetPendenciaUseCase {
  constructor(private readonly repository: PendenciaRepository) {}

  async execute(id: number): Promise<Pendencia> {
    const pendencia = await this.repository.findById(id);
    if (!pendencia) {
      throw new AppError('Pendência não encontrada', 404);
    }
    return pendencia;
  }
}

