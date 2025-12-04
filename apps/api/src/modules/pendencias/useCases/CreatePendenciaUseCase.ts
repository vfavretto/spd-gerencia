import type { CreatePendenciaDTO } from '../dto/PendenciaDTO';
import type { PendenciaRepository } from '../repositories/PendenciaRepository';

export class CreatePendenciaUseCase {
  constructor(private repository: PendenciaRepository) {}

  async execute(data: CreatePendenciaDTO) {
    return this.repository.create(data);
  }
}

