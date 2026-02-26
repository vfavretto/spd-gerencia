import { prisma } from '@spd/db';
import { AppError } from '@shared/errors/AppError';
import type { AditivoRepository } from '../repositories/AditivoRepository';

const TIPOS_COM_VALOR = ['VALOR', 'PRAZO_E_VALOR', 'ACRESCIMO', 'SUPRESSAO'];

export class DeleteAditivoUseCase {
  constructor(private readonly repository: AditivoRepository) {}

  async execute(id: string): Promise<void> {
    const aditivo = await this.repository.findById(id);
    if (!aditivo) {
      throw new AppError('Aditivo não encontrado', 404);
    }

    await this.repository.delete(id);

    // Se aditivo estava vinculado a contrato e envolvia valor, reverter ajuste
    if (aditivo.contratoId && TIPOS_COM_VALOR.includes(aditivo.tipoAditivo)) {
      const contrato = await prisma.contratoExecucao.findUnique({
        where: { id: aditivo.contratoId },
        select: { valorContrato: true }
      });

      if (contrato) {
        const valorAtual = Number(contrato.valorContrato ?? 0);
        const acrescimo = Number(aditivo.valorAcrescimo ?? 0);
        const supressao = Number(aditivo.valorSupressao ?? 0);

        // Reverter: subtrair acréscimos e adicionar supressões
        await prisma.contratoExecucao.update({
          where: { id: aditivo.contratoId },
          data: { valorContrato: valorAtual - acrescimo + supressao }
        });
      }
    }
  }
}
