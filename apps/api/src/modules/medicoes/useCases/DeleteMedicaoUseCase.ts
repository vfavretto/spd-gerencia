import { prisma } from '@spd/db';
import type { MedicaoRepository } from '../repositories/MedicaoRepository';
import { AppError } from '@shared/errors/AppError';

export class DeleteMedicaoUseCase {
  constructor(private readonly repository: MedicaoRepository) {}

  async execute(id: string): Promise<void> {
    // Buscar medição antes de deletar para obter contratoId
    const medicao = await this.repository.findById(id);
    if (!medicao) {
      throw new AppError('Medição não encontrada', 404);
    }

    const { contratoId } = medicao;

    await this.repository.delete(id);

    // Auto-atualizar valorExecutado do contrato
    const novoTotalMedido = await this.repository.getTotalMedido(contratoId);
    await prisma.contratoExecucao.update({
      where: { id: contratoId },
      data: { valorExecutado: novoTotalMedido }
    });
  }
}
