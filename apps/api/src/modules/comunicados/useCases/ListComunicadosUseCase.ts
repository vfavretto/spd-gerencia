import type { Comunicado } from '@spd/db';
import type { ComunicadoRepository } from '../repositories/ComunicadoRepository';

export class ListComunicadosUseCase {
  constructor(private readonly repository: ComunicadoRepository) {}

  execute(): Promise<Comunicado[]> {
    return this.repository.list();
  }
}
