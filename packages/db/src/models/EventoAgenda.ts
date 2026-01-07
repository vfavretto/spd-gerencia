import { Schema, model, type Model } from 'mongoose';
import type { IEventoAgenda } from '../types';
import { TipoEvento } from '../types';

const eventoAgendaSchema = new Schema<IEventoAgenda>(
  {
    titulo: { type: String, required: true },
    descricao: { type: String, default: null },
    tipo: {
      type: String,
      enum: Object.values(TipoEvento),
      default: TipoEvento.OUTROS
    },
    dataInicio: { type: Date, required: true },
    dataFim: { type: Date, default: null },
    local: { type: String, default: null },
    responsavel: { type: String, default: null },
    convenioId: { type: Schema.Types.ObjectId, ref: 'Convenio', default: null }
  },
  {
    timestamps: { createdAt: 'criadoEm', updatedAt: 'atualizadoEm' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual populate
eventoAgendaSchema.virtual('convenio', {
  ref: 'Convenio',
  localField: 'convenioId',
  foreignField: '_id',
  justOne: true
});

// Índices
eventoAgendaSchema.index({ convenioId: 1 });
eventoAgendaSchema.index({ dataInicio: 1 });

export const EventoAgendaModel: Model<IEventoAgenda> = model<IEventoAgenda>('EventoAgenda', eventoAgendaSchema);

