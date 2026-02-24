import type { IAditivo } from '@spd/db';
import type { CreateAditivoDTO, UpdateAditivoDTO } from '../dto/AditivoDTO';

export interface AditivoRepository {
  listByConvenio(convenioId: string): Promise<IAditivo[]>;
  findById(id: string): Promise<IAditivo | null>;
  getNextNumeroAditivo(convenioId: string, contratoId?: string | null): Promise<number>;
  getUltimaVigencia(convenioId: string): Promise<Date | null>;
  isContratoDoConvenio(contratoId: string, convenioId: string): Promise<boolean>;
  create(data: CreateAditivoDTO): Promise<IAditivo>;
  update(id: string, data: UpdateAditivoDTO): Promise<IAditivo>;
  delete(id: string): Promise<void>;
}
