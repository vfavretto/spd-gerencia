import { FichaOrcamentariaModel, type IFichaOrcamentaria } from '@spd/db';
import type { FichaOrcamentariaRepository } from '../FichaOrcamentariaRepository';
import type { CreateFichaOrcamentariaDTO, UpdateFichaOrcamentariaDTO } from '../../dto/FichaOrcamentariaDTO';

export class MongooseFichaOrcamentariaRepository implements FichaOrcamentariaRepository {
  async listByConvenio(convenioId: string): Promise<IFichaOrcamentaria[]> {
    return FichaOrcamentariaModel.find({ convenioId })
      .sort({ tipo: 1, criadoEm: -1 })
      .exec();
  }

  async listByConvenioAndTipo(convenioId: string, tipo: string): Promise<IFichaOrcamentaria[]> {
    return FichaOrcamentariaModel.find({ convenioId, tipo })
      .sort({ criadoEm: -1 })
      .exec();
  }

  async findById(id: string): Promise<IFichaOrcamentaria | null> {
    return FichaOrcamentariaModel.findById(id).exec();
  }

  async create(data: CreateFichaOrcamentariaDTO): Promise<IFichaOrcamentaria> {
    return FichaOrcamentariaModel.create(data);
  }

  async update(id: string, data: UpdateFichaOrcamentariaDTO): Promise<IFichaOrcamentaria> {
    const updated = await FichaOrcamentariaModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    ).exec();
    
    if (!updated) {
      throw new Error('Ficha Orçamentária não encontrada');
    }
    
    return updated;
  }

  async delete(id: string): Promise<void> {
    await FichaOrcamentariaModel.findByIdAndDelete(id).exec();
  }
}
