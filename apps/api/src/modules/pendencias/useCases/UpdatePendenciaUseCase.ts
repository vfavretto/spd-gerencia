import type { Pendencia } from '@spd/db';
import type { UpdatePendenciaDTO } from '../dto/PendenciaDTO';
import type { PendenciaRepository } from '../repositories/PendenciaRepository';

export class UpdatePendenciaUseCase {
  constructor(private readonly repository: PendenciaRepository) {}

  execute(id: number, data: UpdatePendenciaDTO): Promise<Pendencia> {
    // Se está resolvendo a pendência, definir dataResolucao automaticamente
    if (data.status === 'RESOLVIDA' && !data.dataResolucao) {
      data.dataResolucao = new Date();
    }
    return this.repository.update(id, data);
  }
}

