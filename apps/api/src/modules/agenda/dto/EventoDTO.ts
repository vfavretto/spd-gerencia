import type { TipoEvento } from '@spd/db';

export type CreateEventoDTO = {
  titulo: string;
  descricao?: string;
  tipo?: TipoEvento;
  dataInicio: Date;
  dataFim?: Date | null;
  local?: string;
  responsavel?: string;
  convenioId?: number | null;
};

export type UpdateEventoDTO = Partial<CreateEventoDTO>;
