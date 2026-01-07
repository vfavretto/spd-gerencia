import type { IComunicado } from '@spd/db';
import type { ComunicadoRepository } from '../repositories/ComunicadoRepository';

export class ListComunicadosUseCase {
  constructor(private readonly repository: ComunicadoRepository) {}

  execute(): Promise<IComunicado[]> {
    return this.repository.list();
  }
}
