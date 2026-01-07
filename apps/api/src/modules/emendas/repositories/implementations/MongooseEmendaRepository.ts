import { EmendaParlamentarModel, type IEmendaParlamentar } from '@spd/db';
import type { EmendaRepository } from '../EmendaRepository';
import type { CreateEmendaDTO, UpdateEmendaDTO } from '../../dto/EmendaDTO';

export class MongooseEmendaRepository implements EmendaRepository {
  async listByConvenio(convenioId: string): Promise<IEmendaParlamentar[]> {
    return EmendaParlamentarModel.find({ convenioId })
      .sort({ criadoEm: -1 })
      .exec();
  }

  async findById(id: string): Promise<IEmendaParlamentar | null> {
    return EmendaParlamentarModel.findById(id).exec();
  }

  async create(data: CreateEmendaDTO): Promise<IEmendaParlamentar> {
    return EmendaParlamentarModel.create(data);
  }

  async update(id: string, data: UpdateEmendaDTO): Promise<IEmendaParlamentar> {
    const updated = await EmendaParlamentarModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    ).exec();
    
    if (!updated) {
      throw new Error('Emenda não encontrada');
    }
    
    return updated;
  }

  async delete(id: string): Promise<void> {
    await EmendaParlamentarModel.findByIdAndDelete(id).exec();
  }
}

