import type { IContratoExecucao } from '@spd/db';
import type { CreateContratoDTO, UpdateContratoDTO } from '../dto/ContratoDTO';

export interface ContratoRepository {
  listByConvenio(convenioId: string): Promise<IContratoExecucao[]>;
  findById(id: string): Promise<IContratoExecucao | null>;
  findByIdWithMedicoes(id: string): Promise<IContratoExecucao | null>;
  create(data: CreateContratoDTO): Promise<IContratoExecucao>;
  update(id: string, data: UpdateContratoDTO): Promise<IContratoExecucao>;
  delete(id: string): Promise<void>;
}
