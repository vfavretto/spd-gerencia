import type { IMedicao } from '@spd/db';
import type { MedicaoRepository } from '../repositories/MedicaoRepository';
import { AppError } from '@shared/errors/AppError';

export class GetMedicaoUseCase {
  constructor(private readonly repository: MedicaoRepository) {}

  async execute(id: string): Promise<IMedicao> {
    const medicao = await this.repository.findById(id);
    if (!medicao) {
      throw new AppError('Medição não encontrada', 404);
    }
    return medicao;
  }
}
