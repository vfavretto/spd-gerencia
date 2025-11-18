import type { Comunicado } from '@spd/db';
import { AppError } from '@shared/errors/AppError';
import type { ComunicadoRepository } from '../repositories/ComunicadoRepository';

export class GetComunicadoUseCase {
  constructor(private readonly repository: ComunicadoRepository) {}

  async execute(id: number): Promise<Comunicado> {
    const comunicado = await this.repository.findById(id);
    if (!comunicado) {
      throw new AppError('Comunicado não encontrado', 404);
    }
    return comunicado;
  }
}
