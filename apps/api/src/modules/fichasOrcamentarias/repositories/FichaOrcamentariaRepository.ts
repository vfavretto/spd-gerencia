import type { IFichaOrcamentaria } from '@spd/db';
import type { CreateFichaOrcamentariaDTO, UpdateFichaOrcamentariaDTO } from '../dto/FichaOrcamentariaDTO';

export interface FichaOrcamentariaRepository {
  listByConvenio(convenioId: string): Promise<IFichaOrcamentaria[]>;
  listByConvenioAndTipo(convenioId: string, tipo: string): Promise<IFichaOrcamentaria[]>;
  findById(id: string): Promise<IFichaOrcamentaria | null>;
  create(data: CreateFichaOrcamentariaDTO): Promise<IFichaOrcamentaria>;
  update(id: string, data: UpdateFichaOrcamentariaDTO): Promise<IFichaOrcamentaria>;
  delete(id: string): Promise<void>;
}
