import { FinanceiroContasModel, type IFinanceiroContas } from '@spd/db';
import type { FinanceiroRepository } from '../FinanceiroRepository';
import type { CreateFinanceiroDTO, UpdateFinanceiroDTO } from '../../dto/FinanceiroDTO';

export class MongooseFinanceiroRepository implements FinanceiroRepository {
  async findByConvenio(convenioId: string): Promise<IFinanceiroContas | null> {
    return FinanceiroContasModel.findOne({ convenioId }).exec();
  }

  async findById(id: string): Promise<IFinanceiroContas | null> {
    return FinanceiroContasModel.findById(id).exec();
  }

  async create(data: CreateFinanceiroDTO): Promise<IFinanceiroContas> {
    return FinanceiroContasModel.create(data);
  }

  async update(id: string, data: UpdateFinanceiroDTO): Promise<IFinanceiroContas> {
    const updated = await FinanceiroContasModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    ).exec();
    
    if (!updated) {
      throw new Error('Registro financeiro não encontrado');
    }
    
    return updated;
  }

  async upsertByConvenio(
    convenioId: string,
    data: Omit<CreateFinanceiroDTO, 'convenioId'>
  ): Promise<IFinanceiroContas> {
    const result = await FinanceiroContasModel.findOneAndUpdate(
      { convenioId },
      { $set: { ...data, convenioId } },
      { upsert: true, new: true }
    ).exec();
    
    return result!;
  }

  async delete(id: string): Promise<void> {
    await FinanceiroContasModel.findByIdAndDelete(id).exec();
  }
}

