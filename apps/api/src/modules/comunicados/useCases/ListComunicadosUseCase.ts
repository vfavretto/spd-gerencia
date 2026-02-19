import type { Comunicado } from '@spd/db';
import type { ComunicadoRepository } from '../repositories/ComunicadoRepository';
import type { ComunicadoFilters } from '../dto/ComunicadoDTO';

export class ListComunicadosUseCase {
  constructor(private readonly repository: ComunicadoRepository) {}

  execute(filters?: ComunicadoFilters): Promise<Comunicado[]> {
    return this.repository.list(filters);
  }
}
