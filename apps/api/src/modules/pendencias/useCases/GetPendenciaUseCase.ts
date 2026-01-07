import type { PendenciaRepository } from '../repositories/PendenciaRepository';

export class GetPendenciaUseCase {
  constructor(private repository: PendenciaRepository) {}

  async execute(id: string) {
    const pendencia = await this.repository.findById(id);
    if (!pendencia) {
      throw new Error('Pendência não encontrada');
    }
    return pendencia;
  }
}
