import { Schema, model, type Model, Types } from 'mongoose';
import type { IConvenio, IConvenioAnexo, IEtapaConvenio } from '../types';
import { ConvenioStatus, ModalidadeRepasse, EsferaGoverno } from '../types';

// Schema para subdocumento Anexo
const convenioAnexoSchema = new Schema<IConvenioAnexo>(
  {
    _id: { type: Schema.Types.ObjectId, default: () => new Types.ObjectId() },
    nome: { type: String, required: true },
    url: { type: String, required: true },
    tipo: { type: String, default: null },
    criadoEm: { type: Date, default: Date.now }
  },
  { _id: false }
);

// Schema para subdocumento Etapa
const etapaConvenioSchema = new Schema<IEtapaConvenio>(
  {
    _id: { type: Schema.Types.ObjectId, default: () => new Types.ObjectId() },
    titulo: { type: String, required: true },
    descricao: { type: String, default: null },
    dataPrevista: { type: Date, default: null },
    dataRealizada: { type: Date, default: null },
    responsavel: { type: String, default: null },
    situacao: { type: String, default: null },
    criadoEm: { type: Date, default: Date.now },
    atualizadoEm: { type: Date, default: Date.now }
  },
  { _id: false }
);

// Schema principal do Convenio
const convenioSchema = new Schema<IConvenio>(
  {
    codigo: { type: String, required: true, unique: true },
    titulo: { type: String, required: true },
    objeto: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(ConvenioStatus),
      default: ConvenioStatus.RASCUNHO
    },
    descricao: { type: String, default: null },
    observacoes: { type: String, default: null },

    // Campos de identificação
    numeroProposta: { type: String, default: null },
    dataInicioProcesso: { type: Date, default: null },
    modalidadeRepasse: {
      type: String,
      enum: [...Object.values(ModalidadeRepasse), null],
      default: null
    },
    termoFormalizacao: { type: String, default: null },
    numeroTermo: { type: String, default: null },
    clausulaSuspensiva: { type: Boolean, default: false },
    esfera: {
      type: String,
      enum: [...Object.values(EsferaGoverno), null],
      default: null
    },
    ministerioOrgao: { type: String, default: null },
    objetoDescricao: { type: String, default: null },

    // Valores financeiros
    valorGlobal: { type: Number, required: true },
    valorRepasse: { type: Number, default: null },
    valorContrapartida: { type: Number, default: null },

    // Datas importantes
    dataAssinatura: { type: Date, default: null },
    dataInicioVigencia: { type: Date, default: null },
    dataFimVigencia: { type: Date, default: null },
    dataPrestacaoContas: { type: Date, default: null },

    // Relacionamentos (referencias)
    secretariaId: { type: Schema.Types.ObjectId, ref: 'Secretaria', required: true },
    orgaoId: { type: Schema.Types.ObjectId, ref: 'OrgaoConcedente', default: null },
    programaId: { type: Schema.Types.ObjectId, ref: 'Programa', default: null },
    fonteId: { type: Schema.Types.ObjectId, ref: 'FonteRecurso', default: null },

    // Subdocumentos embedded
    anexos: { type: [convenioAnexoSchema], default: [] },
    etapas: { type: [etapaConvenioSchema], default: [] }
  },
  {
    timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual populate para relacionamentos
convenioSchema.virtual('secretaria', {
  ref: 'Secretaria',
  localField: 'secretariaId',
  foreignField: '_id',
  justOne: true
});

convenioSchema.virtual('orgao', {
  ref: 'OrgaoConcedente',
  localField: 'orgaoId',
  foreignField: '_id',
  justOne: true
});

convenioSchema.virtual('programa', {
  ref: 'Programa',
  localField: 'programaId',
  foreignField: '_id',
  justOne: true
});

convenioSchema.virtual('fonte', {
  ref: 'FonteRecurso',
  localField: 'fonteId',
  foreignField: '_id',
  justOne: true
});

convenioSchema.virtual('emendas', {
  ref: 'EmendaParlamentar',
  localField: '_id',
  foreignField: 'convenioId'
});

convenioSchema.virtual('financeiroContas', {
  ref: 'FinanceiroContas',
  localField: '_id',
  foreignField: 'convenioId',
  justOne: true
});

convenioSchema.virtual('contratos', {
  ref: 'ContratoExecucao',
  localField: '_id',
  foreignField: 'convenioId'
});

convenioSchema.virtual('pendencias', {
  ref: 'Pendencia',
  localField: '_id',
  foreignField: 'convenioId'
});

convenioSchema.virtual('aditivos', {
  ref: 'Aditivo',
  localField: '_id',
  foreignField: 'convenioId'
});

// Índices (codigo já tem unique: true no schema)
convenioSchema.index({ status: 1 });
convenioSchema.index({ secretariaId: 1 });
convenioSchema.index({ titulo: 'text', codigo: 'text' });

export const ConvenioModel: Model<IConvenio> = model<IConvenio>('Convenio', convenioSchema);

