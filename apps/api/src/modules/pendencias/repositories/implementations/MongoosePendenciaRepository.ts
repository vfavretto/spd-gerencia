import { PendenciaModel, StatusPendencia, type IPendencia } from '@spd/db';
import type { PendenciaFilters, PendenciaRepository } from '../PendenciaRepository';
import type { CreatePendenciaDTO, UpdatePendenciaDTO } from '../../dto/PendenciaDTO';

export class MongoosePendenciaRepository implements PendenciaRepository {
  async listByConvenio(convenioId: string, filters?: PendenciaFilters): Promise<IPendencia[]> {
    const query: Record<string, unknown> = { convenioId };
    
    if (filters?.status) {
      query.status = filters.status;
    }
    
    if (filters?.prioridade !== undefined) {
      query.prioridade = filters.prioridade;
    }

    return PendenciaModel.find(query)
      .populate('criadoPor', 'id nome')
      .sort({ prioridade: 1, criadoEm: -1 })
      .exec();
  }

  async findById(id: string): Promise<IPendencia | null> {
    return PendenciaModel.findById(id)
      .populate('criadoPor', 'id nome')
      .exec();
  }

  async countByStatus(convenioId: string): Promise<Record<string, number>> {
    const counts = await PendenciaModel.aggregate([
      { $match: { convenioId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    return counts.reduce(
      (acc, item) => {
        acc[item._id] = item.count;
        return acc;
      },
      {} as Record<string, number>
    );
  }

  async create(data: CreatePendenciaDTO): Promise<IPendencia> {
    const pendencia = await PendenciaModel.create({
      descricao: data.descricao,
      responsavel: data.responsavel,
      prazo: data.prazo,
      status: (data.status as StatusPendencia) ?? StatusPendencia.ABERTA,
      prioridade: data.prioridade ?? 2,
      resolucao: data.resolucao,
      dataResolucao: data.dataResolucao,
      convenioId: data.convenioId,
      criadoPorId: data.criadoPorId
    });
    
    return pendencia.populate('criadoPor', 'id nome');
  }

  async update(id: string, data: UpdatePendenciaDTO): Promise<IPendencia> {
    const updated = await PendenciaModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    )
      .populate('criadoPor', 'id nome')
      .exec();
    
    if (!updated) {
      throw new Error('Pendência não encontrada');
    }
    
    return updated;
  }

  async delete(id: string): Promise<void> {
    await PendenciaModel.findByIdAndDelete(id).exec();
  }
}

