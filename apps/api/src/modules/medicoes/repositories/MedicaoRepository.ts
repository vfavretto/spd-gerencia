import type { Medicao } from '@spd/db';
import type { CreateMedicaoDTO, UpdateMedicaoDTO } from '../dto/MedicaoDTO';

export interface MedicaoRepository {
  listByContrato(contratoId: number): Promise<Medicao[]>;
  findById(id: number): Promise<Medicao | null>;
  getNextNumeroMedicao(contratoId: number): Promise<number>;
  getTotalMedido(contratoId: number): Promise<number>;
  create(data: CreateMedicaoDTO): Promise<Medicao>;
  update(id: number, data: UpdateMedicaoDTO): Promise<Medicao>;
  delete(id: number): Promise<void>;
}

