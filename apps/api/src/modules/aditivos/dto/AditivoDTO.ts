import type { TipoAditivo } from '@spd/db';

export type CreateAditivoDTO = {
  numeroAditivo?: number;
  tipoAditivo: TipoAditivo;
  dataAssinatura?: Date | null;
  novaVigencia?: Date | null;
  valorAcrescimo?: number;
  valorSupressao?: number;
  motivo?: string;
  justificativa?: string;
  observacoes?: string;
  convenioId: number;
};

export type UpdateAditivoDTO = Partial<Omit<CreateAditivoDTO, 'convenioId' | 'numeroAditivo'>>;

