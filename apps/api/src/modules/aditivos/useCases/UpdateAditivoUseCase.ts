import { prisma, type IAditivo } from '@spd/db';
import { AppError } from '@shared/errors/AppError';
import type { UpdateAditivoDTO } from '../dto/AditivoDTO';
import type { AditivoRepository } from '../repositories/AditivoRepository';

const TIPOS_COM_VALOR = ['VALOR', 'PRAZO_E_VALOR', 'ACRESCIMO', 'SUPRESSAO'];

export class UpdateAditivoUseCase {
  constructor(private readonly repository: AditivoRepository) {}

  async execute(id: string, data: UpdateAditivoDTO): Promise<IAditivo> {
    const aditivoAntigo = await this.repository.findById(id);
    if (!aditivoAntigo) {
      throw new AppError('Aditivo não encontrado', 404);
    }

    const aditivo = await this.repository.update(id, data);

    // Se aditivo vinculado a contrato e envolve valor, recalcular ajuste
    if (aditivoAntigo.contratoId && TIPOS_COM_VALOR.includes(aditivoAntigo.tipoAditivo)) {
      const contrato = await prisma.contratoExecucao.findUnique({
        where: { id: aditivoAntigo.contratoId },
        select: { valorContrato: true }
      });

      if (contrato) {
        const valorAtual = Number(contrato.valorContrato ?? 0);

        // Reverter valores antigos
        const acrescimoAntigo = Number(aditivoAntigo.valorAcrescimo ?? 0);
        const supressaoAntiga = Number(aditivoAntigo.valorSupressao ?? 0);

        // Aplicar valores novos
        const acrescimoNovo = Number(aditivo.valorAcrescimo ?? 0);
        const supressaoNova = Number(aditivo.valorSupressao ?? 0);

        const novoValor = valorAtual
          - acrescimoAntigo + supressaoAntiga   // Reverter antigo
          + acrescimoNovo - supressaoNova;       // Aplicar novo

        await prisma.contratoExecucao.update({
          where: { id: aditivoAntigo.contratoId },
          data: { valorContrato: novoValor }
        });
      }
    }

    return aditivo;
  }
}
