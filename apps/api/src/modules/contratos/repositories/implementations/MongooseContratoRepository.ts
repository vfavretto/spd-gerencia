import { ContratoExecucaoModel, type IContratoExecucao } from '@spd/db';
import type { ContratoRepository } from '../ContratoRepository';
import type { CreateContratoDTO, UpdateContratoDTO } from '../../dto/ContratoDTO';

export class MongooseContratoRepository implements ContratoRepository {
  async listByConvenio(convenioId: string): Promise<IContratoExecucao[]> {
    return ContratoExecucaoModel.find({ convenioId })
      .populate('medicoes')
      .sort({ criadoEm: -1 })
      .exec();
  }

  async findById(id: string): Promise<IContratoExecucao | null> {
    return ContratoExecucaoModel.findById(id).exec();
  }

  async findByIdWithMedicoes(id: string): Promise<IContratoExecucao | null> {
    return ContratoExecucaoModel.findById(id)
      .populate({
        path: 'medicoes',
        options: { sort: { numeroMedicao: 1 } }
      })
      .exec();
  }

  async create(data: CreateContratoDTO): Promise<IContratoExecucao> {
    return ContratoExecucaoModel.create(data);
  }

  async update(id: string, data: UpdateContratoDTO): Promise<IContratoExecucao> {
    const updated = await ContratoExecucaoModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    ).exec();
    
    if (!updated) {
      throw new Error('Contrato não encontrado');
    }
    
    return updated;
  }

  async delete(id: string): Promise<void> {
    await ContratoExecucaoModel.findByIdAndDelete(id).exec();
  }
}

