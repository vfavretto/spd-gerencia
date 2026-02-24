import type { IAditivo } from '@spd/db';
import { AppError } from '@shared/errors/AppError';
import type { CreateAditivoDTO } from '../dto/AditivoDTO';
import type { AditivoRepository } from '../repositories/AditivoRepository';

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

    return this.repository.create({
      ...data,
      numeroAditivo
    });
  }
}
