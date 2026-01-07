import type { UpdatePendenciaDTO } from '../dto/PendenciaDTO';
import type { PendenciaRepository } from '../repositories/PendenciaRepository';

export class UpdatePendenciaUseCase {
  constructor(private repository: PendenciaRepository) {}

  async execute(id: string, data: UpdatePendenciaDTO) {
    // Verificar se existe
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Pendência não encontrada');
    }
    return this.repository.update(id, data);
  }
}
