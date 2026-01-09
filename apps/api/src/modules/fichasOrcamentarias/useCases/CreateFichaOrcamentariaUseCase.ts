import type { IFichaOrcamentaria } from '@spd/db';
import type { CreateFichaOrcamentariaDTO } from '../dto/FichaOrcamentariaDTO';
import type { FichaOrcamentariaRepository } from '../repositories/FichaOrcamentariaRepository';

export class CreateFichaOrcamentariaUseCase {
  constructor(private readonly repository: FichaOrcamentariaRepository) {}

  execute(data: CreateFichaOrcamentariaDTO): Promise<IFichaOrcamentaria> {
    return this.repository.create(data);
  }
}
