import { Schema, model, type Model } from 'mongoose';
import type { ISecretaria } from '../types';

const secretariaSchema = new Schema<ISecretaria>(
  {
    nome: { type: String, required: true, unique: true },
    sigla: { type: String, default: null, sparse: true, unique: true },
    responsavel: { type: String, default: null }
  },
  {
    timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

export const SecretariaModel: Model<ISecretaria> = model<ISecretaria>('Secretaria', secretariaSchema);

