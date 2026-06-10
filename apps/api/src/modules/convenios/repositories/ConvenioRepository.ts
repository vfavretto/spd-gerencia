import type { IConvenio } from '@spd/db';
import type {
  CreateConvenioDTO,
  UpdateConvenioDTO
} from '../dto/ConvenioDTO';

export type ConvenioFilters = {
  search?: string;
  status?: string;
  secretariaId?: string;
  esfera?: string;
  modalidadeRepasseId?: string;
  dataInicioVigencia?: string | Date;
  dataFimVigencia?: string | Date;
  valorMin?: number;
  valorMax?: number;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
};

// Tipo leve para listagens (sem relacionamentos pesados)
export type ConvenioLite = {
  id: string;
  codigo: string;
  titulo: string;
  objeto: string;
  status: string;
  valorGlobal: number;
  dataInicioVigencia: Date | null;
  dataFimVigencia: Date | null;
  atualizadoEm: Date;
  secretaria: { nome: string; sigla: string | null } | null;
  _count: {
    pendencias: number;
    contratos: number;
  };
};

export interface ConvenioRepository {
  list(filters?: ConvenioFilters, page?: number, limit?: number): Promise<PaginatedResult<IConvenio>>;
  listLite(filters?: ConvenioFilters, page?: number, limit?: number): Promise<PaginatedResult<ConvenioLite>>;
  findById(id: string): Promise<IConvenio | null>;
  create(data: CreateConvenioDTO): Promise<IConvenio>;
  update(id: string, data: UpdateConvenioDTO): Promise<IConvenio>;
  delete(id: string): Promise<void>;
}
