import type { Comunicado } from '@spd/db';
import type {
  CreateComunicadoDTO,
  UpdateComunicadoDTO
} from '../dto/ComunicadoDTO';

export interface ComunicadoRepository {
  list(): Promise<Comunicado[]>;
  findById(id: number): Promise<Comunicado | null>;
  create(data: CreateComunicadoDTO): Promise<Comunicado>;
  update(id: number, data: UpdateComunicadoDTO): Promise<Comunicado>;
  delete(id: number): Promise<void>;
}
