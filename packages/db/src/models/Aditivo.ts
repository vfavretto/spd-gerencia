import { Schema, model, type Model } from 'mongoose';
import type { IAditivo } from '../types';
import { TipoAditivo } from '../types';

const aditivoSchema = new Schema<IAditivo>(
  {
    numeroAditivo: { type: Number, required: true },
    tipoAditivo: {
      type: String,
      enum: Object.values(TipoAditivo),
      required: true
    },
    dataAssinatura: { type: Date, default: null },
    novaVigencia: { type: Date, default: null },
    valorAcrescimo: { type: Number, default: null },
    valorSupressao: { type: Number, default: null },
    motivo: { type: String, default: null },
    justificativa: { type: String, default: null },
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
aditivoSchema.index({ convenioId: 1, numeroAditivo: 1 }, { unique: true });

export const AditivoModel: Model<IAditivo> = model<IAditivo>('Aditivo', aditivoSchema);

