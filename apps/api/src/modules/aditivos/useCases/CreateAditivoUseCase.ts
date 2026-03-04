import { prisma, type IAditivo } from '@spd/db';
import { AppError } from '@shared/errors/AppError';
import type { CreateAditivoDTO } from '../dto/AditivoDTO';
import type { AditivoRepository } from '../repositories/AditivoRepository';

const TIPOS_COM_VALOR = ['VALOR', 'PRAZO_E_VALOR', 'ACRESCIMO', 'SUPRESSAO'];
const TIPOS_COM_PRAZO = ['PRAZO', 'PRAZO_E_VALOR'];

export class CreateAditivoUseCase {
  constructor(private readonly repository: AditivoRepository) {}

  async execute(data: CreateAditivoDTO): Promise<IAditivo> {
    if (data.contratoId) {
      const contratoPertenceAoConvenio = await this.repository.isContratoDoConvenio(
        data.contratoId,
        data.convenioId
      );

      if (!contratoPertenceAoConvenio) {
        throw new AppError('Contrato não pertence ao convênio informado', 400);
      }
    }

    // Obter próximo número de aditivo automaticamente se não informado
    const numeroAditivo = data.numeroAditivo
      || await this.repository.getNextNumeroAditivo(data.convenioId, data.contratoId);

    const aditivo = await this.repository.create({
      ...data,
      numeroAditivo
    });

    if (data.contratoId) {
      const updateData: Record<string, unknown> = {};

      // Se envolve valor, ajustar valorContrato
      if (TIPOS_COM_VALOR.includes(data.tipoAditivo)) {
        const contrato = await prisma.contratoExecucao.findUnique({
          where: { id: data.contratoId },
          select: { valorContrato: true }
        });

        if (contrato) {
          const valorAtual = Number(contrato.valorContrato ?? 0);
          const acrescimo = Number(data.valorAcrescimo ?? 0);
          const supressao = Number(data.valorSupressao ?? 0);
          updateData.valorContrato = valorAtual + acrescimo - supressao;
        }
      }

      // Se envolve prazo, ajustar dataTerminoExecucao e dataVigenciaFim
      if (TIPOS_COM_PRAZO.includes(data.tipoAditivo) && data.novaVigencia) {
        updateData.dataTerminoExecucao = new Date(data.novaVigencia);
        updateData.dataVigenciaFim = new Date(data.novaVigencia);
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.contratoExecucao.update({
          where: { id: data.contratoId },
          data: updateData
        });
      }
    }

    return aditivo;
  }
}
