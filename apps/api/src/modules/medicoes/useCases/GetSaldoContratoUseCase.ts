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
  constructor(private readonly _repository: MedicaoRepository) {}

  async execute(contratoId: string): Promise<SaldoContrato> {
    const contrato = await prisma.contratoExecucao.findUnique({
      where: { id: contratoId },
      select: { valorContrato: true }
    });

    if (!contrato) {
      throw new AppError('Contrato não encontrado', 404);
    }

    const medicoes = await prisma.medicao.findMany({
      where: { contratoId },
      select: { valorMedido: true, valorPago: true }
    });

    const valorContrato = Number(contrato.valorContrato ?? 0);
    const totalMedido = medicoes.reduce(
      (acc, m) => acc + Number(m.valorMedido),
      0
    );
    const totalPago = medicoes.reduce(
      (acc, m) => acc + Number(m.valorPago ?? 0),
      0
    );

    return {
      valorContrato,
      totalMedido,
      totalPago,
      saldoMedir: valorContrato - totalMedido,
      saldoPagar: totalMedido - totalPago,
      percentualExecutado: valorContrato > 0
        ? Math.round((totalMedido / valorContrato) * 10000) / 100
        : 0
    };
  }
}
