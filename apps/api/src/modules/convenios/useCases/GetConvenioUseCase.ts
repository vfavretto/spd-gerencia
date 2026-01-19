import type { IConvenio } from '@spd/db';
import { AppError } from '@shared/errors/AppError';
import type { ConvenioRepository } from '../repositories/ConvenioRepository';

export class GetConvenioUseCase {
  constructor(private readonly repository: ConvenioRepository) {}

  async execute(id: string): Promise<IConvenio & { saldo: number }> {
    const convenio = await this.repository.findById(id);
    if (!convenio) {
      throw new AppError('Convênio não encontrado', 404);
    }

    const totalEmpenhos = (convenio.notasEmpenho ?? []).reduce(
      (acc, nota) => acc + Number(nota.valor ?? 0),
      0
    );

    const totalMedicoesPagas = (convenio.contratos ?? []).reduce(
      (acc, contrato) =>
        acc +
        (contrato.medicoes ?? []).reduce(
          (sum, medicao) => sum + Number(medicao.valorPago ?? 0),
          0
        ),
      0
    );

    const saldo = totalEmpenhos - totalMedicoesPagas;

    return {
      ...convenio,
      saldo
    };
  }
}
