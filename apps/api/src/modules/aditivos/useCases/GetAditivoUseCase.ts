import type { Aditivo } from '@spd/db';
import type { AditivoRepository } from '../repositories/AditivoRepository';
import { AppError } from '@shared/errors/AppError';

export class GetAditivoUseCase {
  constructor(private readonly repository: AditivoRepository) {}

  async execute(id: number): Promise<Aditivo> {
    const aditivo = await this.repository.findById(id);
    if (!aditivo) {
      throw new AppError('Aditivo não encontrado', 404);
    }
    return aditivo;
  }
}

