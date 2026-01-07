import type { IEmendaParlamentar } from '@spd/db';
import type { EmendaRepository } from '../repositories/EmendaRepository';
import { AppError } from '@shared/errors/AppError';

export class GetEmendaUseCase {
  constructor(private readonly repository: EmendaRepository) {}

  async execute(id: string): Promise<IEmendaParlamentar> {
    const emenda = await this.repository.findById(id);
    if (!emenda) {
      throw new AppError('Emenda não encontrada', 404);
    }
    return emenda;
  }
}
