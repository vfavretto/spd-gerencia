import type { Convenio } from '@spd/db';
import type {
  CreateConvenioDTO,
  UpdateConvenioDTO
} from '../dto/ConvenioDTO';
import type { ConvenioRepository } from '../repositories/ConvenioRepository';

export class CreateConvenioUseCase {
  constructor(private readonly repository: ConvenioRepository) {}

  execute(data: CreateConvenioDTO): Promise<Convenio> {
    return this.repository.create(data);
  }
}
