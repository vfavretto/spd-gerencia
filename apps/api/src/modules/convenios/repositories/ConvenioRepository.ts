import type { Convenio } from '@spd/db';
import type {
  CreateConvenioDTO,
  UpdateConvenioDTO
} from '../dto/ConvenioDTO';

export type ConvenioFilters = {
  search?: string;
  status?: string;
  secretariaId?: number;
};

export interface ConvenioRepository {
  list(filters?: ConvenioFilters): Promise<Convenio[]>;
  findById(id: number): Promise<Convenio | null>;
  create(data: CreateConvenioDTO): Promise<Convenio>;
  update(id: number, data: UpdateConvenioDTO): Promise<Convenio>;
  delete(id: number): Promise<void>;
}
