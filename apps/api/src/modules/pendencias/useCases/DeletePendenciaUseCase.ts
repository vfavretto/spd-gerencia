import type { PendenciaRepository } from '../repositories/PendenciaRepository';

export class DeletePendenciaUseCase {
  constructor(private repository: PendenciaRepository) {}

  async execute(id: string) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error('Pendência não encontrada');
    }
    await this.repository.delete(id);
  }
}
