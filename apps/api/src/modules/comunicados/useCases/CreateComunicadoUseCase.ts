import type { IComunicado } from '@spd/db';
import type { CreateComunicadoDTO } from '../dto/ComunicadoDTO';
import type { ComunicadoRepository } from '../repositories/ComunicadoRepository';

export class CreateComunicadoUseCase {
  constructor(private readonly repository: ComunicadoRepository) {}

  execute(data: CreateComunicadoDTO): Promise<IComunicado> {
    return this.repository.create(data);
  }
}
