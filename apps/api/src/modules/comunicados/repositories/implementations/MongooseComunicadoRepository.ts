import { ComunicadoModel, type IComunicado } from '@spd/db';
import type {
  CreateComunicadoDTO,
  UpdateComunicadoDTO
} from '../../dto/ComunicadoDTO';
import type { ComunicadoRepository } from '../ComunicadoRepository';

export class MongooseComunicadoRepository implements ComunicadoRepository {
  async list(): Promise<IComunicado[]> {
    return ComunicadoModel.find()
      .populate('convenio')
      .sort({ dataRegistro: -1 })
      .exec();
  }

  async findById(id: string): Promise<IComunicado | null> {
    return ComunicadoModel.findById(id)
      .populate('convenio')
      .exec();
  }

  async create(data: CreateComunicadoDTO): Promise<IComunicado> {
    const comunicado = await ComunicadoModel.create(data);
    return comunicado.populate('convenio');
  }

  async update(id: string, data: UpdateComunicadoDTO): Promise<IComunicado> {
    const updated = await ComunicadoModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    )
      .populate('convenio')
      .exec();
    
    if (!updated) {
      throw new Error('Comunicado não encontrado');
    }
    
    return updated;
  }

  async delete(id: string): Promise<void> {
    await ComunicadoModel.findByIdAndDelete(id).exec();
  }
}

