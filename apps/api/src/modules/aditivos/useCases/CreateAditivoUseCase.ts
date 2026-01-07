import type { IAditivo } from '@spd/db';
import type { CreateAditivoDTO } from '../dto/AditivoDTO';
import type { AditivoRepository } from '../repositories/AditivoRepository';

export class CreateAditivoUseCase {
  constructor(private readonly repository: AditivoRepository) {}

  async execute(data: CreateAditivoDTO): Promise<IAditivo> {
    // Obter próximo número de aditivo automaticamente se não informado
    const numeroAditivo = data.numeroAditivo || await this.repository.getNextNumeroAditivo(data.convenioId);

    return this.repository.create({
      ...data,
      numeroAditivo
    });
  }
}

