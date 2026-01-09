import { Schema, model, type Model } from 'mongoose';
import type { IMedicao } from '../types';

const medicaoSchema = new Schema<IMedicao>(
  {
    numeroMedicao: { type: Number, required: true },
    dataMedicao: { type: Date, required: true },
    percentualFisico: { type: Number, default: null },
    valorMedido: { type: Number, required: true },
    dataPagamento: { type: Date, default: null },
    valorPago: { type: Number, default: null },
    observacoes: { type: String, default: null },
    situacao: { type: String, default: null },
    processoMedicao: { type: String, default: null },
    contratoId: { type: Schema.Types.ObjectId, ref: 'ContratoExecucao', required: true }
  },
  {
    timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Índices
medicaoSchema.index({ contratoId: 1, numeroMedicao: 1 }, { unique: true });

export const MedicaoModel: Model<IMedicao> = model<IMedicao>('Medicao', medicaoSchema);

