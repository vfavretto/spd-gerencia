import type { Aditivo } from '@spd/db';
import type { UpdateAditivoDTO } from '../dto/AditivoDTO';
import type { AditivoRepository } from '../repositories/AditivoRepository';

export class UpdateAditivoUseCase {
  constructor(private readonly repository: AditivoRepository) {}

  execute(id: number, data: UpdateAditivoDTO): Promise<Aditivo> {
    return this.repository.update(id, data);
  }
}

