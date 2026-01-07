import type { IComunicado } from '@spd/db';
import { AppError } from '@shared/errors/AppError';
import type { UpdateComunicadoDTO } from '../dto/ComunicadoDTO';
import type { ComunicadoRepository } from '../repositories/ComunicadoRepository';

export class UpdateComunicadoUseCase {
  constructor(private readonly repository: ComunicadoRepository) {}

  async execute(id: string, data: UpdateComunicadoDTO): Promise<IComunicado> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new AppError('Comunicado não encontrado', 404);
    }
    return this.repository.update(id, data);
  }
}
