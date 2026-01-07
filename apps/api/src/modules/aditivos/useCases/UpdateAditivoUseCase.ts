import type { IAditivo } from '@spd/db';
import type { UpdateAditivoDTO } from '../dto/AditivoDTO';
import type { AditivoRepository } from '../repositories/AditivoRepository';

export class UpdateAditivoUseCase {
  constructor(private readonly repository: AditivoRepository) {}

  execute(id: string, data: UpdateAditivoDTO): Promise<IAditivo> {
    return this.repository.update(id, data);
  }
}

