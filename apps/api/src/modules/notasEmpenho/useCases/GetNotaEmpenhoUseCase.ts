import type { INotaEmpenho } from '@spd/db';
import type { NotaEmpenhoRepository } from '../repositories/NotaEmpenhoRepository';
import { AppError } from '@shared/errors/AppError';

export class GetNotaEmpenhoUseCase {
  constructor(private readonly repository: NotaEmpenhoRepository) {}

  async execute(id: string): Promise<INotaEmpenho> {
    const nota = await this.repository.findById(id);
    
    if (!nota) {
      throw new AppError('Nota de Empenho não encontrada', 404);
    }
    
    return nota;
  }
}
