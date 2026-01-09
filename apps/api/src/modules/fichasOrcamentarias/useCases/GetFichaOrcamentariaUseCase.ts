import type { IFichaOrcamentaria } from '@spd/db';
import type { FichaOrcamentariaRepository } from '../repositories/FichaOrcamentariaRepository';
import { AppError } from '@shared/errors/AppError';

export class GetFichaOrcamentariaUseCase {
  constructor(private readonly repository: FichaOrcamentariaRepository) {}

  async execute(id: string): Promise<IFichaOrcamentaria> {
    const ficha = await this.repository.findById(id);
    
    if (!ficha) {
      throw new AppError('Ficha Orçamentária não encontrada', 404);
    }
    
    return ficha;
  }
}
