import { Schema, model, type Model } from 'mongoose';
import type { IEmendaParlamentar } from '../types';

const emendaParlamentarSchema = new Schema<IEmendaParlamentar>(
  {
    nomeParlamentar: { type: String, required: true },
    partido: { type: String, default: null },
    codigoEmenda: { type: String, default: null },
    funcao: { type: String, default: null },
    subfuncao: { type: String, default: null },
    programa: { type: String, default: null },
    valorIndicado: { type: Number, default: null },
    anoEmenda: { type: Number, default: null },
    convenioId: { type: Schema.Types.ObjectId, ref: 'Convenio', required: true }
  },
  {
    timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Índices
emendaParlamentarSchema.index({ convenioId: 1 });

export const EmendaParlamentarModel: Model<IEmendaParlamentar> = model<IEmendaParlamentar>('EmendaParlamentar', emendaParlamentarSchema);

