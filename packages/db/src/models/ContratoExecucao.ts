import { Schema, model, type Model } from 'mongoose';
import type { IContratoExecucao } from '../types';
import { ModalidadeLicitacao } from '../types';

const contratoExecucaoSchema = new Schema<IContratoExecucao>(
  {
    numProcessoLicitatorio: { type: String, default: null },
    modalidadeLicitacao: {
      type: String,
      enum: [...Object.values(ModalidadeLicitacao), null],
      default: null
    },
    numeroContrato: { type: String, default: null },
    contratadaCnpj: { type: String, default: null },
    contratadaNome: { type: String, default: null },
    dataAssinatura: { type: Date, default: null },
    dataVigenciaInicio: { type: Date, default: null },
    dataVigenciaFim: { type: Date, default: null },
    dataOIS: { type: Date, default: null },
    valorContrato: { type: Number, default: null },
    valorExecutado: { type: Number, default: null },
    engenheiroResponsavel: { type: String, default: null },
    creaEngenheiro: { type: String, default: null },
    artRrt: { type: String, default: null },
    situacao: { type: String, default: null },
    observacoes: { type: String, default: null },
    // Novos campos
    cno: { type: String, default: null },
    prazoExecucaoDias: { type: Number, default: null },
    dataTerminoExecucao: { type: Date, default: null },
    convenioId: { type: Schema.Types.ObjectId, ref: 'Convenio', required: true }
  },
  {
    timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual populate para medições
contratoExecucaoSchema.virtual('medicoes', {
  ref: 'Medicao',
  localField: '_id',
  foreignField: 'contratoId'
});

// Índices
contratoExecucaoSchema.index({ convenioId: 1 });

export const ContratoExecucaoModel: Model<IContratoExecucao> = model<IContratoExecucao>('ContratoExecucao', contratoExecucaoSchema);

