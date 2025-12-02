import type { FinanceiroContas } from '@spd/db';
import type { CreateFinanceiroDTO, UpdateFinanceiroDTO } from '../dto/FinanceiroDTO';

export interface FinanceiroRepository {
  findByConvenio(convenioId: number): Promise<FinanceiroContas | null>;
  findById(id: number): Promise<FinanceiroContas | null>;
  create(data: CreateFinanceiroDTO): Promise<FinanceiroContas>;
  update(id: number, data: UpdateFinanceiroDTO): Promise<FinanceiroContas>;
  upsertByConvenio(convenioId: number, data: Omit<CreateFinanceiroDTO, 'convenioId'>): Promise<FinanceiroContas>;
  delete(id: number): Promise<void>;
}

