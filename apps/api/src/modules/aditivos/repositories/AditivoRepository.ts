import type { Aditivo } from '@spd/db';
import type { CreateAditivoDTO, UpdateAditivoDTO } from '../dto/AditivoDTO';

export interface AditivoRepository {
  listByConvenio(convenioId: number): Promise<Aditivo[]>;
  findById(id: number): Promise<Aditivo | null>;
  getNextNumeroAditivo(convenioId: number): Promise<number>;
  getUltimaVigencia(convenioId: number): Promise<Date | null>;
  create(data: CreateAditivoDTO): Promise<Aditivo>;
  update(id: number, data: UpdateAditivoDTO): Promise<Aditivo>;
  delete(id: number): Promise<void>;
}

