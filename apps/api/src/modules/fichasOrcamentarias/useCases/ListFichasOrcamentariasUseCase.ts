import type { IFichaOrcamentaria } from '@spd/db';
import type { FichaOrcamentariaRepository } from '../repositories/FichaOrcamentariaRepository';

export class ListFichasOrcamentariasUseCase {
  constructor(private readonly repository: FichaOrcamentariaRepository) {}

  execute(convenioId: string, tipo?: string): Promise<IFichaOrcamentaria[]> {
    if (tipo) {
      return this.repository.listByConvenioAndTipo(convenioId, tipo);
    }
    return this.repository.listByConvenio(convenioId);
  }
}
