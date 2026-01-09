import type { INotaEmpenho } from '@spd/db';
import type { NotaEmpenhoRepository } from '../repositories/NotaEmpenhoRepository';

export class ListNotasEmpenhoUseCase {
  constructor(private readonly repository: NotaEmpenhoRepository) {}

  execute(convenioId: string, tipo?: string): Promise<INotaEmpenho[]> {
    if (tipo) {
      return this.repository.listByConvenioAndTipo(convenioId, tipo);
    }
    return this.repository.listByConvenio(convenioId);
  }
}
