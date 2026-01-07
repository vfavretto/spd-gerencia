import { ContratoExecucaoModel, MedicaoModel } from '@spd/db';
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
    const contrato = await ContratoExecucaoModel.findById(contratoId)
      .select('valorContrato')
      .exec();

    if (!contrato) {
      throw new AppError('Contrato não encontrado', 404);
    }

    const medicoes = await MedicaoModel.find({ contratoId })
      .select('valorMedido valorPago')
      .exec();

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
      percentualExecutado: valorContrato > 0 ? (totalMedido / valorContrato) * 100 : 0
    };
  }
}
