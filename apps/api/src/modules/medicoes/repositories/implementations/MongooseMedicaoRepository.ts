import { MedicaoModel, type IMedicao } from '@spd/db';
import type { MedicaoRepository } from '../MedicaoRepository';
import type { CreateMedicaoDTO, UpdateMedicaoDTO } from '../../dto/MedicaoDTO';

export class MongooseMedicaoRepository implements MedicaoRepository {
  async listByContrato(contratoId: string): Promise<IMedicao[]> {
    return MedicaoModel.find({ contratoId })
      .sort({ numeroMedicao: 1 })
      .exec();
  }

  async findById(id: string): Promise<IMedicao | null> {
    return MedicaoModel.findById(id).exec();
  }

  async getNextNumeroMedicao(contratoId: string): Promise<number> {
    const lastMedicao = await MedicaoModel.findOne({ contratoId })
      .sort({ numeroMedicao: -1 })
      .select('numeroMedicao')
      .exec();
    return (lastMedicao?.numeroMedicao ?? 0) + 1;
  }

  async getTotalMedido(contratoId: string): Promise<number> {
    const result = await MedicaoModel.aggregate([
      { $match: { contratoId } },
      { $group: { _id: null, total: { $sum: '$valorMedido' } } }
    ]);
    return result[0]?.total ?? 0;
  }

  async create(data: CreateMedicaoDTO): Promise<IMedicao> {
    return MedicaoModel.create(data);
  }

  async update(id: string, data: UpdateMedicaoDTO): Promise<IMedicao> {
    const updated = await MedicaoModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    ).exec();
    
    if (!updated) {
      throw new Error('Medição não encontrada');
    }
    
    return updated;
  }

  async delete(id: string): Promise<void> {
    await MedicaoModel.findByIdAndDelete(id).exec();
  }
}

