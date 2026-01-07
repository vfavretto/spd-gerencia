import type { IConvenio } from '@spd/db';
import type { CreateConvenioDTO } from '../dto/ConvenioDTO';
import type { ConvenioRepository } from '../repositories/ConvenioRepository';

export class CreateConvenioUseCase {
  constructor(private readonly repository: ConvenioRepository) {}

  execute(data: CreateConvenioDTO): Promise<IConvenio> {
    return this.repository.create(data);
  }
}
