import type { Convenio } from '@spd/db';
import { AppError } from '@shared/errors/AppError';
import type { ConvenioRepository } from '../repositories/ConvenioRepository';

export class GetConvenioUseCase {
  constructor(private readonly repository: ConvenioRepository) {}

  async execute(id: number): Promise<Convenio> {
    const convenio = await this.repository.findById(id);
    if (!convenio) {
      throw new AppError('Convênio não encontrado', 404);
    }
    return convenio;
  }
}
