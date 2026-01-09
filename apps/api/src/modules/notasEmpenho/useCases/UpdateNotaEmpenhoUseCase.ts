import type { INotaEmpenho } from '@spd/db';
import type { UpdateNotaEmpenhoDTO } from '../dto/NotaEmpenhoDTO';
import type { NotaEmpenhoRepository } from '../repositories/NotaEmpenhoRepository';

export class UpdateNotaEmpenhoUseCase {
  constructor(private readonly repository: NotaEmpenhoRepository) {}

  execute(id: string, data: UpdateNotaEmpenhoDTO): Promise<INotaEmpenho> {
    return this.repository.update(id, data);
  }
}
