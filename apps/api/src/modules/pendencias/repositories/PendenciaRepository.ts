import type { Pendencia } from '@spd/db';
import type { CreatePendenciaDTO, UpdatePendenciaDTO } from '../dto/PendenciaDTO';

export type PendenciaFilters = {
  status?: string;
  prioridade?: number;
};

export interface PendenciaRepository {
  listByConvenio(convenioId: number, filters?: PendenciaFilters): Promise<Pendencia[]>;
  findById(id: number): Promise<Pendencia | null>;
  countByStatus(convenioId: number): Promise<Record<string, number>>;
  create(data: CreatePendenciaDTO): Promise<Pendencia>;
  update(id: number, data: UpdatePendenciaDTO): Promise<Pendencia>;
  delete(id: number): Promise<void>;
}

