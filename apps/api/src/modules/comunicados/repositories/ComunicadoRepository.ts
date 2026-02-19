import type { Comunicado } from '@spd/db';
import type {
  CreateComunicadoDTO,
  UpdateComunicadoDTO,
  ComunicadoFilters
} from '../dto/ComunicadoDTO';

export interface ComunicadoRepository {
  list(filters?: ComunicadoFilters): Promise<Comunicado[]>;
  findById(id: string): Promise<Comunicado | null>;
  create(data: CreateComunicadoDTO): Promise<Comunicado>;
  update(id: string, data: UpdateComunicadoDTO): Promise<Comunicado>;
  delete(id: string): Promise<void>;
}
