import type { IPendencia, StatusPendencia } from '@spd/db';
import type { CreatePendenciaDTO, UpdatePendenciaDTO } from '../dto/PendenciaDTO';

export type PendenciaFilters = {
  status?: StatusPendencia;
  prioridade?: number;
};

export interface PendenciaRepository {
  listByConvenio(convenioId: string, filters?: PendenciaFilters): Promise<IPendencia[]>;
  findById(id: string): Promise<IPendencia | null>;
  countByStatus(convenioId: string): Promise<Record<string, number>>;
  create(data: CreatePendenciaDTO): Promise<IPendencia>;
  update(id: string, data: UpdatePendenciaDTO): Promise<IPendencia>;
  delete(id: string): Promise<void>;
}
