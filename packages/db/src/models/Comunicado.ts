import { Schema, model, type Model } from 'mongoose';
import type { IComunicado } from '../types';
import { TipoComunicado } from '../types';

const comunicadoSchema = new Schema<IComunicado>(
  {
    protocolo: { type: String, required: true, unique: true },
    assunto: { type: String, required: true },
    conteudo: { type: String, default: null },
    tipo: {
      type: String,
      enum: Object.values(TipoComunicado),
      required: true
    },
    status: { type: String, default: null },
    dataRegistro: { type: Date, default: Date.now },
    origem: { type: String, default: null },
    destino: { type: String, default: null },
    responsavel: { type: String, default: null },
    arquivoUrl: { type: String, default: null },
    convenioId: { type: Schema.Types.ObjectId, ref: 'Convenio', default: null },
    criadoPorId: { type: Schema.Types.ObjectId, ref: 'Usuario', default: null }
  },
  {
    timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual populate
comunicadoSchema.virtual('convenio', {
  ref: 'Convenio',
  localField: 'convenioId',
  foreignField: '_id',
  justOne: true
});

comunicadoSchema.virtual('criadoPor', {
  ref: 'Usuario',
  localField: 'criadoPorId',
  foreignField: '_id',
  justOne: true
});

// Índices (protocolo já tem unique: true no schema)
comunicadoSchema.index({ convenioId: 1 });
comunicadoSchema.index({ tipo: 1 });

export const ComunicadoModel: Model<IComunicado> = model<IComunicado>('Comunicado', comunicadoSchema);

