import { prisma } from '@spd/db';
import type { MedicaoRepository } from '../repositories/MedicaoRepository';
import { AppError } from '@shared/errors/AppError';

export type SaldoContrato = {
  valorContrato: number;
  totalMedido: number;
  totalPago: number;
  saldoMedir: number;
  saldoPagar: number;
  percentualExecutado: number;
};

export class GetSaldoContratoUseCase {
  constructor(private readonly repository: MedicaoRepository) {}

  async execute(contratoId: number): Promise<SaldoContrato> {
    const contrato = await prisma.contratoExecucao.findUnique({
      where: { id: contratoId },
      include: {
        medicoes: {
          select: { valorMedido: true, valorPago: true }
        }
      }
    });

    if (!contrato) {
      throw new AppError('Contrato não encontrado', 404);
    }

    const valorContrato = Number(contrato.valorContrato ?? 0);
    const totalMedido = contrato.medicoes.reduce(
      (acc, m) => acc + Number(m.valorMedido),
      0
    );
    const totalPago = contrato.medicoes.reduce(
      (acc, m) => acc + Number(m.valorPago ?? 0),
      0
    );

    return {
      valorContrato,
      totalMedido,
      totalPago,
      saldoMedir: valorContrato - totalMedido,
      saldoPagar: totalMedido - totalPago,
      percentualExecutado: valorContrato > 0 ? (totalMedido / valorContrato) * 100 : 0
    };
  }
}

