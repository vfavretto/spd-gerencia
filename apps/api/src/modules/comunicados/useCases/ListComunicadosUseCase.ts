import type { IComunicado } from '@spd/db';
import type { ComunicadoRepository } from '../repositories/ComunicadoRepository';
import type { ComunicadoFilters } from '../dto/ComunicadoDTO';

export class ListComunicadosUseCase {
  constructor(private readonly repository: ComunicadoRepository) {}

  execute(filters?: ComunicadoFilters): Promise<IComunicado[]> {
    return this.repository.list(filters);
  }
}
