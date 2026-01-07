import { Schema, model, type Model } from 'mongoose';
import type { IUsuario } from '../types';
import { UsuarioRole } from '../types';

const usuarioSchema = new Schema<IUsuario>(
  {
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(UsuarioRole),
      default: UsuarioRole.ANALISTA
    },
    ativo: { type: Boolean, default: true }
  },
  {
    timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

export const UsuarioModel: Model<IUsuario> = model<IUsuario>('Usuario', usuarioSchema);

