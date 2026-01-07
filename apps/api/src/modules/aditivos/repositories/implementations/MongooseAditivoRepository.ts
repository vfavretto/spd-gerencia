import { AditivoModel, ConvenioModel, type IAditivo } from '@spd/db';
import type { AditivoRepository } from '../AditivoRepository';
import type { CreateAditivoDTO, UpdateAditivoDTO } from '../../dto/AditivoDTO';

export class MongooseAditivoRepository implements AditivoRepository {
  async listByConvenio(convenioId: string): Promise<IAditivo[]> {
    return AditivoModel.find({ convenioId })
      .sort({ numeroAditivo: 1 })
      .exec();
  }

  async findById(id: string): Promise<IAditivo | null> {
    return AditivoModel.findById(id).exec();
  }

  async getNextNumeroAditivo(convenioId: string): Promise<number> {
    const lastAditivo = await AditivoModel.findOne({ convenioId })
      .sort({ numeroAditivo: -1 })
      .select('numeroAditivo')
      .exec();
    return (lastAditivo?.numeroAditivo ?? 0) + 1;
  }

  async getUltimaVigencia(convenioId: string): Promise<Date | null> {
    // Primeiro verifica se há aditivos com nova vigência
    const ultimoAditivo = await AditivoModel.findOne({
      convenioId,
      novaVigencia: { $ne: null }
    })
      .sort({ numeroAditivo: -1 })
      .select('novaVigencia')
      .exec();

    if (ultimoAditivo?.novaVigencia) {
      return ultimoAditivo.novaVigencia;
    }

    // Senão, retorna a vigência original do convênio
    const convenio = await ConvenioModel.findById(convenioId)
      .select('dataFimVigencia')
      .exec();

    return convenio?.dataFimVigencia ?? null;
  }

  async create(data: CreateAditivoDTO): Promise<IAditivo> {
    return AditivoModel.create({
      ...data,
      numeroAditivo: data.numeroAditivo!
    });
  }

  async update(id: string, data: UpdateAditivoDTO): Promise<IAditivo> {
    const updated = await AditivoModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    ).exec();
    
    if (!updated) {
      throw new Error('Aditivo não encontrado');
    }
    
    return updated;
  }

  async delete(id: string): Promise<void> {
    await AditivoModel.findByIdAndDelete(id).exec();
  }
}

