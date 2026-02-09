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
  modalidadeRepasse?: string;
  dataInicioVigencia?: string;
  dataFimVigencia?: string;
  valorMin?: number;
  valorMax?: number;
};

// Tipo leve para listagens (sem relacionamentos pesados)
export type ConvenioLite = {
  id: string;
  codigo: string;
  titulo: string;
  objeto: string;
  status: string;
  valorGlobal: number | string;
  dataFimVigencia: Date | null | undefined;
  atualizadoEm: Date;
  secretaria: { nome: string; sigla: string | null } | null;
  _count: {
    pendencias: number;
    contratos: number;
  };
};

export interface ConvenioRepository {
  list(filters?: ConvenioFilters): Promise<IConvenio[]>;
  listLite(filters?: ConvenioFilters): Promise<ConvenioLite[]>;
  findById(id: string): Promise<IConvenio | null>;
  create(data: CreateConvenioDTO): Promise<IConvenio>;
  update(id: string, data: UpdateConvenioDTO): Promise<IConvenio>;
  delete(id: string): Promise<void>;
}
