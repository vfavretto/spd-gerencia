import type { IContratoExecucao } from '@spd/db';
import type { UpdateContratoDTO } from '../dto/ContratoDTO';
import type { ContratoRepository } from '../repositories/ContratoRepository';

export class UpdateContratoUseCase {
  constructor(private readonly repository: ContratoRepository) {}

  execute(id: string, data: UpdateContratoDTO): Promise<IContratoExecucao> {
    return this.repository.update(id, data);
  }
}
