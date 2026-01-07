import { Schema, model, type Model } from 'mongoose';
import type { IOrgaoConcedente } from '../types';

const orgaoConcedenteSchema = new Schema<IOrgaoConcedente>(
  {
    nome: { type: String, required: true, unique: true },
    esfera: { type: String, default: null },
    contato: { type: String, default: null }
  },
  {
    timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Índices
orgaoConcedenteSchema.index({ nome: 1 }, { unique: true });

export const OrgaoConcedenteModel: Model<IOrgaoConcedente> = model<IOrgaoConcedente>('OrgaoConcedente', orgaoConcedenteSchema);

