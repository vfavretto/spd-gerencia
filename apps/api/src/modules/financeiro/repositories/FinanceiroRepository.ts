import type { IFinanceiroContas } from '@spd/db';
import type { CreateFinanceiroDTO, UpdateFinanceiroDTO } from '../dto/FinanceiroDTO';

export interface FinanceiroRepository {
  findByConvenio(convenioId: string): Promise<IFinanceiroContas | null>;
  findById(id: string): Promise<IFinanceiroContas | null>;
  create(data: CreateFinanceiroDTO): Promise<IFinanceiroContas>;
  update(id: string, data: UpdateFinanceiroDTO): Promise<IFinanceiroContas>;
  upsertByConvenio(convenioId: string, data: Omit<CreateFinanceiroDTO, 'convenioId'>): Promise<IFinanceiroContas>;
  delete(id: string): Promise<void>;
}
