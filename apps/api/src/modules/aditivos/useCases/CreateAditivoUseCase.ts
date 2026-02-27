import { prisma, type IAditivo } from '@spd/db';
import { AppError } from '@shared/errors/AppError';
import type { CreateAditivoDTO } from '../dto/AditivoDTO';
import type { AditivoRepository } from '../repositories/AditivoRepository';

const TIPOS_COM_VALOR = ['VALOR', 'PRAZO_E_VALOR', 'ACRESCIMO', 'SUPRESSAO'];

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

    // Se aditivo vinculado a contrato e envolve valor, ajustar valorContrato
    if (data.contratoId && TIPOS_COM_VALOR.includes(data.tipoAditivo)) {
      const contrato = await prisma.contratoExecucao.findUnique({
        where: { id: data.contratoId },
        select: { valorContrato: true }
      });

      if (contrato) {
        const valorAtual = Number(contrato.valorContrato ?? 0);
        const acrescimo = Number(data.valorAcrescimo ?? 0);
        const supressao = Number(data.valorSupressao ?? 0);

        await prisma.contratoExecucao.update({
          where: { id: data.contratoId },
          data: { valorContrato: valorAtual + acrescimo - supressao }
        });
      }
    }

    return aditivo;
  }
}
