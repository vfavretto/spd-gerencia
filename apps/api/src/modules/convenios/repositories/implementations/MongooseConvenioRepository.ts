import { 
  ConvenioModel, 
  PendenciaModel, 
  ContratoExecucaoModel,
  StatusPendencia,
  type IConvenio 
} from '@spd/db';
import type {
  ConvenioFilters,
  ConvenioRepository,
  ConvenioLite
} from '../ConvenioRepository';
import type {
  CreateConvenioDTO,
  UpdateConvenioDTO
} from '../../dto/ConvenioDTO';

const populateOptions = [
  { path: 'secretaria' },
  { path: 'orgao' },
  { path: 'programa' },
  { path: 'fonte' },
  { path: 'emendas' },
  { path: 'financeiroContas' },
  { 
    path: 'contratos',
    populate: {
      path: 'medicoes',
      options: { sort: { numeroMedicao: 1 } }
    }
  },
  { 
    path: 'pendencias',
    match: { status: { $in: [StatusPendencia.ABERTA, StatusPendencia.EM_ANDAMENTO] } },
    options: { sort: { prioridade: 1 } }
  },
  { path: 'aditivos', options: { sort: { numeroAditivo: 1 } } }
];

export class MongooseConvenioRepository implements ConvenioRepository {
  async listLite(filters?: ConvenioFilters): Promise<ConvenioLite[]> {
    const query: Record<string, unknown> = {};
    
    if (filters?.status) {
      query.status = filters.status;
    }
    
    if (filters?.secretariaId) {
      query.secretariaId = filters.secretariaId;
    }
    
    if (filters?.search) {
      query.$or = [
        { titulo: { $regex: filters.search, $options: 'i' } },
        { codigo: { $regex: filters.search, $options: 'i' } }
      ];
    }

    const convenios = await ConvenioModel.find(query)
      .select('codigo titulo objeto status valorGlobal dataFimVigencia atualizadoEm secretariaId')
      .populate('secretaria', 'nome sigla')
      .sort({ atualizadoEm: -1 })
      .lean()
      .exec();

    // Buscar contagem de pendências e contratos para cada convênio
    const results: ConvenioLite[] = await Promise.all(
      convenios.map(async (conv) => {
        const [pendenciasCount, contratosCount] = await Promise.all([
          PendenciaModel.countDocuments({ convenioId: conv._id }),
          ContratoExecucaoModel.countDocuments({ convenioId: conv._id })
        ]);

        return {
          id: conv._id.toString(),
          codigo: conv.codigo,
          titulo: conv.titulo,
          objeto: conv.objeto,
          status: conv.status,
          valorGlobal: conv.valorGlobal,
          dataFimVigencia: conv.dataFimVigencia,
          atualizadoEm: conv.atualizadoEm,
          secretaria: conv.secretaria as { nome: string; sigla: string | null } | null,
          _count: {
            pendencias: pendenciasCount,
            contratos: contratosCount
          }
        };
      })
    );

    return results;
  }

  async list(filters?: ConvenioFilters): Promise<IConvenio[]> {
    const query: Record<string, unknown> = {};
    
    if (filters?.status) {
      query.status = filters.status;
    }
    
    if (filters?.secretariaId) {
      query.secretariaId = filters.secretariaId;
    }
    
    if (filters?.search) {
      query.$or = [
        { titulo: { $regex: filters.search, $options: 'i' } },
        { codigo: { $regex: filters.search, $options: 'i' } }
      ];
    }

    return ConvenioModel.find(query)
      .populate(populateOptions)
      .sort({ atualizadoEm: -1 })
      .exec();
  }

  async findById(id: string): Promise<IConvenio | null> {
    return ConvenioModel.findById(id)
      .populate(populateOptions)
      .exec();
  }

  async create(data: CreateConvenioDTO): Promise<IConvenio> {
    const convenio = await ConvenioModel.create(data);
    return convenio.populate(populateOptions);
  }

  async update(id: string, data: UpdateConvenioDTO): Promise<IConvenio> {
    const updated = await ConvenioModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    )
      .populate(populateOptions)
      .exec();
    
    if (!updated) {
      throw new Error('Convênio não encontrado');
    }
    
    return updated;
  }

  async delete(id: string): Promise<void> {
    await ConvenioModel.findByIdAndDelete(id).exec();
  }
}

