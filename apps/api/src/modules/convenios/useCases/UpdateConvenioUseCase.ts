import type { IConvenio } from '@spd/db';
import { AppError } from '@shared/errors/AppError';
import type { UpdateConvenioDTO } from '../dto/ConvenioDTO';
import type { ConvenioRepository } from '../repositories/ConvenioRepository';

export class UpdateConvenioUseCase {
  constructor(private readonly repository: ConvenioRepository) {}

  async execute(id: string, data: UpdateConvenioDTO): Promise<IConvenio> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new AppError('Convênio não encontrado', 404);
    }

    if (data.status === 'CONCLUIDO') {
      const totalEmpenhos = (existing.notasEmpenho ?? []).reduce(
        (acc, nota) => acc + Number(nota.valor ?? 0),
        0
      );

      const totalMedicoesPagas = (existing.contratos ?? []).reduce(
        (acc, contrato) =>
          acc +
          (contrato.medicoes ?? []).reduce(
            (sum, medicao) => sum + Number(medicao.valorPago ?? 0),
            0
          ),
        0
      );

      const saldo = totalEmpenhos - totalMedicoesPagas;
      const pendenciasAbertas = (existing.pendencias ?? []).length > 0;

      if (saldo > 0) {
        throw new AppError('Não é possível concluir: saldo financeiro pendente.', 400);
      }

      if (pendenciasAbertas) {
        throw new AppError('Não é possível concluir: existem pendências em aberto.', 400);
      }
    }

    return this.repository.update(id, data);
  }
}
