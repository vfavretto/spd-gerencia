import type { IFichaOrcamentaria } from '@spd/db';
import type { UpdateFichaOrcamentariaDTO } from '../dto/FichaOrcamentariaDTO';
import type { FichaOrcamentariaRepository } from '../repositories/FichaOrcamentariaRepository';

export class UpdateFichaOrcamentariaUseCase {
  constructor(private readonly repository: FichaOrcamentariaRepository) {}

  execute(id: string, data: UpdateFichaOrcamentariaDTO): Promise<IFichaOrcamentaria> {
    return this.repository.update(id, data);
  }
}
