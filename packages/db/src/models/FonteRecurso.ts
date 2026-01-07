import { Schema, model, type Model } from 'mongoose';
import type { IFonteRecurso } from '../types';

const fonteRecursoSchema = new Schema<IFonteRecurso>(
  {
    nome: { type: String, required: true, unique: true },
    tipo: { type: String, default: null }
  },
  {
    timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Índices
fonteRecursoSchema.index({ nome: 1 }, { unique: true });

export const FonteRecursoModel: Model<IFonteRecurso> = model<IFonteRecurso>('FonteRecurso', fonteRecursoSchema);

