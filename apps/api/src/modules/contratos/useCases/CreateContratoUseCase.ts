import type { IContratoExecucao } from '@spd/db';
import type { CreateContratoDTO } from '../dto/ContratoDTO';
import type { ContratoRepository } from '../repositories/ContratoRepository';

export class CreateContratoUseCase {
  constructor(private readonly repository: ContratoRepository) {}

  execute(data: CreateContratoDTO): Promise<IContratoExecucao> {
    return this.repository.create(data);
  }
}
