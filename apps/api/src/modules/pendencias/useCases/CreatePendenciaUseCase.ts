import type { Pendencia } from '@spd/db';
import type { CreatePendenciaDTO } from '../dto/PendenciaDTO';
import type { PendenciaRepository } from '../repositories/PendenciaRepository';

export class CreatePendenciaUseCase {
  constructor(private readonly repository: PendenciaRepository) {}

  execute(data: CreatePendenciaDTO): Promise<Pendencia> {
    return this.repository.create(data);
  }
}

