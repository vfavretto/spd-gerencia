import { Schema, model, type Model } from 'mongoose';
import type { IPendencia } from '../types';
import { StatusPendencia } from '../types';

const pendenciaSchema = new Schema<IPendencia>(
  {
    descricao: { type: String, required: true },
    responsavel: { type: String, default: null },
    prazo: { type: Date, default: null },
    status: {
      type: String,
      enum: Object.values(StatusPendencia),
      default: StatusPendencia.ABERTA
    },
    prioridade: { type: Number, default: 2 },
    resolucao: { type: String, default: null },
    dataResolucao: { type: Date, default: null },
    convenioId: { type: Schema.Types.ObjectId, ref: 'Convenio', required: true },
    criadoPorId: { type: Schema.Types.ObjectId, ref: 'Usuario', default: null }
  },
  {
    timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual populate para criador
pendenciaSchema.virtual('criadoPor', {
  ref: 'Usuario',
  localField: 'criadoPorId',
  foreignField: '_id',
  justOne: true
});

// Índices
pendenciaSchema.index({ convenioId: 1 });
pendenciaSchema.index({ status: 1 });

export const PendenciaModel: Model<IPendencia> = model<IPendencia>('Pendencia', pendenciaSchema);

