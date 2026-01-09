import { Schema, model, type Model } from 'mongoose';
import type { IFichaOrcamentaria } from '../types';
import { TipoFichaOrcamentaria } from '../types';

const fichaOrcamentariaSchema = new Schema<IFichaOrcamentaria>(
  {
    numero: { type: String, required: true },
    tipo: {
      type: String,
      enum: Object.values(TipoFichaOrcamentaria),
      required: true
    },
    descricao: { type: String, default: null },
    valor: { type: Number, default: null },
    convenioId: { type: Schema.Types.ObjectId, ref: 'Convenio', required: true }
  },
  {
    timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Índices
fichaOrcamentariaSchema.index({ convenioId: 1 });
fichaOrcamentariaSchema.index({ convenioId: 1, tipo: 1 });

export const FichaOrcamentariaModel: Model<IFichaOrcamentaria> = model<IFichaOrcamentaria>('FichaOrcamentaria', fichaOrcamentariaSchema);
