import type { ContratoExecucao } from '@spd/db';
import type { UpdateContratoDTO } from '../dto/ContratoDTO';
import type { ContratoRepository } from '../repositories/ContratoRepository';

export class UpdateContratoUseCase {
  constructor(private readonly repository: ContratoRepository) {}

  execute(id: number, data: UpdateContratoDTO): Promise<ContratoExecucao> {
    return this.repository.update(id, data);
  }
}

