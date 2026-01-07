import type { IMedicao } from '@spd/db';
import type { CreateMedicaoDTO, UpdateMedicaoDTO } from '../dto/MedicaoDTO';

export interface MedicaoRepository {
  listByContrato(contratoId: string): Promise<IMedicao[]>;
  findById(id: string): Promise<IMedicao | null>;
  getNextNumeroMedicao(contratoId: string): Promise<number>;
  getTotalMedido(contratoId: string): Promise<number>;
  create(data: CreateMedicaoDTO): Promise<IMedicao>;
  update(id: string, data: UpdateMedicaoDTO): Promise<IMedicao>;
  delete(id: string): Promise<void>;
}
