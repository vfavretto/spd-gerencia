import { AppError } from '@shared/errors/AppError';
import type { ConvenioRepository } from '../repositories/ConvenioRepository';

export class DeleteConvenioUseCase {
  constructor(private readonly repository: ConvenioRepository) {}

  async execute(id: number): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new AppError('Convênio não encontrado', 404);
    }
    await this.repository.delete(id);
  }
}
