import { NotaEmpenhoModel, type INotaEmpenho } from '@spd/db';
import type { NotaEmpenhoRepository } from '../NotaEmpenhoRepository';
import type { CreateNotaEmpenhoDTO, UpdateNotaEmpenhoDTO } from '../../dto/NotaEmpenhoDTO';

export class MongooseNotaEmpenhoRepository implements NotaEmpenhoRepository {
  async listByConvenio(convenioId: string): Promise<INotaEmpenho[]> {
    return NotaEmpenhoModel.find({ convenioId })
      .sort({ tipo: 1, dataEmissao: -1 })
      .exec();
  }

  async listByConvenioAndTipo(convenioId: string, tipo: string): Promise<INotaEmpenho[]> {
    return NotaEmpenhoModel.find({ convenioId, tipo })
      .sort({ dataEmissao: -1 })
      .exec();
  }

  async findById(id: string): Promise<INotaEmpenho | null> {
    return NotaEmpenhoModel.findById(id).exec();
  }

  async create(data: CreateNotaEmpenhoDTO): Promise<INotaEmpenho> {
    return NotaEmpenhoModel.create(data);
  }

  async update(id: string, data: UpdateNotaEmpenhoDTO): Promise<INotaEmpenho> {
    const updated = await NotaEmpenhoModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    ).exec();
    
    if (!updated) {
      throw new Error('Nota de Empenho não encontrada');
    }
    
    return updated;
  }

  async delete(id: string): Promise<void> {
    await NotaEmpenhoModel.findByIdAndDelete(id).exec();
  }

  async sumByConvenioAndTipo(convenioId: string, tipo: string): Promise<number> {
    const result = await NotaEmpenhoModel.aggregate([
      { $match: { convenioId, tipo } },
      { $group: { _id: null, total: { $sum: '$valor' } } }
    ]).exec();
    
    return result[0]?.total ?? 0;
  }
}
