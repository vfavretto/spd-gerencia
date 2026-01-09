import type { INotaEmpenho } from '@spd/db';
import type { CreateNotaEmpenhoDTO, UpdateNotaEmpenhoDTO } from '../dto/NotaEmpenhoDTO';

export interface NotaEmpenhoRepository {
  listByConvenio(convenioId: string): Promise<INotaEmpenho[]>;
  listByConvenioAndTipo(convenioId: string, tipo: string): Promise<INotaEmpenho[]>;
  findById(id: string): Promise<INotaEmpenho | null>;
  create(data: CreateNotaEmpenhoDTO): Promise<INotaEmpenho>;
  update(id: string, data: UpdateNotaEmpenhoDTO): Promise<INotaEmpenho>;
  delete(id: string): Promise<void>;
  sumByConvenioAndTipo(convenioId: string, tipo: string): Promise<number>;
}
