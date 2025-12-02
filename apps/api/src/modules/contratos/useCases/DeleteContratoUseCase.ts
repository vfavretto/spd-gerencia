import type { ContratoRepository } from '../repositories/ContratoRepository';

export class DeleteContratoUseCase {
  constructor(private readonly repository: ContratoRepository) {}

  execute(id: number): Promise<void> {
    return this.repository.delete(id);
  }
}

