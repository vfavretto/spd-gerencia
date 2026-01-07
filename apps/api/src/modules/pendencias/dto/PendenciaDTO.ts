export type CreatePendenciaDTO = {
  descricao: string;
  responsavel?: string | null;
  prazo?: Date | null;
  status?: string;
  prioridade?: number;
  resolucao?: string | null;
  dataResolucao?: Date | null;
  convenioId: string;
  criadoPorId?: string;
};

export type UpdatePendenciaDTO = Partial<Omit<CreatePendenciaDTO, 'convenioId' | 'criadoPorId'>>;
