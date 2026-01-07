import type { IEmendaParlamentar } from '@spd/db';
import type { CreateEmendaDTO, UpdateEmendaDTO } from '../dto/EmendaDTO';

export interface EmendaRepository {
  listByConvenio(convenioId: string): Promise<IEmendaParlamentar[]>;
  findById(id: string): Promise<IEmendaParlamentar | null>;
  create(data: CreateEmendaDTO): Promise<IEmendaParlamentar>;
  update(id: string, data: UpdateEmendaDTO): Promise<IEmendaParlamentar>;
  delete(id: string): Promise<void>;
}
