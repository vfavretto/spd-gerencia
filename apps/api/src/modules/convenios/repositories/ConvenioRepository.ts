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

// Tipo leve para listagens (sem relacionamentos pesados)
export type ConvenioLite = {
  id: number;
  codigo: string;
  titulo: string;
  objeto: string;
  status: string;
  valorGlobal: number | string;
  dataFimVigencia: Date | null;
  atualizadoEm: Date;
  secretaria: { nome: string; sigla: string | null } | null;
  _count: {
    pendencias: number;
    contratos: number;
  };
};

export interface ConvenioRepository {
  list(filters?: ConvenioFilters): Promise<Convenio[]>;
  listLite(filters?: ConvenioFilters): Promise<ConvenioLite[]>;
  findById(id: number): Promise<Convenio | null>;
  create(data: CreateConvenioDTO): Promise<Convenio>;
  update(id: number, data: UpdateConvenioDTO): Promise<Convenio>;
  delete(id: number): Promise<void>;
}
