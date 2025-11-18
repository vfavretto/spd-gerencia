import type { Convenio } from '@spd/db';
import { AppError } from '@shared/errors/AppError';
import type { UpdateConvenioDTO } from '../dto/ConvenioDTO';
import type { ConvenioRepository } from '../repositories/ConvenioRepository';

export class UpdateConvenioUseCase {
  constructor(private readonly repository: ConvenioRepository) {}

  async execute(id: number, data: UpdateConvenioDTO): Promise<Convenio> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new AppError('Convênio não encontrado', 404);
    }
    return this.repository.update(id, data);
  }
}
