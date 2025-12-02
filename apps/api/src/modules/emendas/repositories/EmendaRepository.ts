import type { EmendaParlamentar } from '@spd/db';
import type { CreateEmendaDTO, UpdateEmendaDTO } from '../dto/EmendaDTO';

export interface EmendaRepository {
  listByConvenio(convenioId: number): Promise<EmendaParlamentar[]>;
  findById(id: number): Promise<EmendaParlamentar | null>;
  create(data: CreateEmendaDTO): Promise<EmendaParlamentar>;
  update(id: number, data: UpdateEmendaDTO): Promise<EmendaParlamentar>;
  delete(id: number): Promise<void>;
}

