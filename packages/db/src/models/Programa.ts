import { Schema, model, type Model } from 'mongoose';
import type { IPrograma } from '../types';

const programaSchema = new Schema<IPrograma>(
  {
    nome: { type: String, required: true, unique: true },
    codigo: { type: String, default: null, sparse: true, unique: true },
    descricao: { type: String, default: null }
  },
  {
    timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Índices
programaSchema.index({ nome: 1 }, { unique: true });

export const ProgramaModel: Model<IPrograma> = model<IPrograma>('Programa', programaSchema);

