import { Schema, model, type Model } from 'mongoose';
import type { IFinanceiroContas } from '../types';

const financeiroContasSchema = new Schema<IFinanceiroContas>(
  {
    banco: { type: String, default: null },
    agencia: { type: String, default: null },
    contaBancaria: { type: String, default: null },
    valorLiberadoTotal: { type: Number, default: null },
    saldoRendimentos: { type: Number, default: null },
    fichasOrcamentarias: { type: String, default: null },
    observacoes: { type: String, default: null },
    // Novos campos
    codigoReceita: { type: String, default: null },
    dataDeposito: { type: Date, default: null },
    valorCPExclusiva: { type: Number, default: null },
    convenioId: { type: Schema.Types.ObjectId, ref: 'Convenio', required: true, unique: true }
  },
  {
    timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

export const FinanceiroContasModel: Model<IFinanceiroContas> = model<IFinanceiroContas>('FinanceiroContas', financeiroContasSchema);

