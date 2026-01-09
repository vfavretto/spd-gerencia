import { Schema, model, type Model } from 'mongoose';
import type { INotaEmpenho } from '../types';
import { TipoEmpenho } from '../types';

const notaEmpenhoSchema = new Schema<INotaEmpenho>(
  {
    numero: { type: String, required: true },
    tipo: {
      type: String,
      enum: Object.values(TipoEmpenho),
      required: true
    },
    valor: { type: Number, required: true },
    dataEmissao: { type: Date, required: true },
    observacoes: { type: String, default: null },
    convenioId: { type: Schema.Types.ObjectId, ref: 'Convenio', required: true }
  },
  {
    timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Índices
notaEmpenhoSchema.index({ convenioId: 1 });
notaEmpenhoSchema.index({ convenioId: 1, tipo: 1 });
notaEmpenhoSchema.index({ numero: 1 });

export const NotaEmpenhoModel: Model<INotaEmpenho> = model<INotaEmpenho>('NotaEmpenho', notaEmpenhoSchema);
