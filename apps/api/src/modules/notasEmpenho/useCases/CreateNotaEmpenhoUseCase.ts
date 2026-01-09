import type { INotaEmpenho } from '@spd/db';
import type { CreateNotaEmpenhoDTO } from '../dto/NotaEmpenhoDTO';
import type { NotaEmpenhoRepository } from '../repositories/NotaEmpenhoRepository';

export class CreateNotaEmpenhoUseCase {
  constructor(private readonly repository: NotaEmpenhoRepository) {}

  execute(data: CreateNotaEmpenhoDTO): Promise<INotaEmpenho> {
    return this.repository.create(data);
  }
}
