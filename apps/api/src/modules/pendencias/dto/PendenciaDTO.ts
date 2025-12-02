import type { StatusPendencia } from '@spd/db';

export type CreatePendenciaDTO = {
  descricao: string;
  responsavel?: string;
  prazo?: Date | null;
  status?: StatusPendencia;
  prioridade?: number;
  resolucao?: string;
  dataResolucao?: Date | null;
  convenioId: number;
  criadoPorId?: number;
};

export type UpdatePendenciaDTO = Partial<Omit<CreatePendenciaDTO, 'convenioId' | 'criadoPorId'>>;

