import type { IComunicado } from '@spd/db';
import type {
  CreateComunicadoDTO,
  UpdateComunicadoDTO,
  ComunicadoFilters
} from '../dto/ComunicadoDTO';

export interface ComunicadoRepository {
  list(filters?: ComunicadoFilters): Promise<IComunicado[]>;
  findById(id: string): Promise<IComunicado | null>;
  create(data: CreateComunicadoDTO): Promise<IComunicado>;
  update(id: string, data: UpdateComunicadoDTO): Promise<IComunicado>;
  delete(id: string): Promise<void>;
}
