import type { ContratoExecucao } from '@spd/db';
import type { CreateContratoDTO, UpdateContratoDTO } from '../dto/ContratoDTO';

export interface ContratoRepository {
  listByConvenio(convenioId: number): Promise<ContratoExecucao[]>;
  findById(id: number): Promise<ContratoExecucao | null>;
  findByIdWithMedicoes(id: number): Promise<ContratoExecucao | null>;
  create(data: CreateContratoDTO): Promise<ContratoExecucao>;
  update(id: number, data: UpdateContratoDTO): Promise<ContratoExecucao>;
  delete(id: number): Promise<void>;
}

