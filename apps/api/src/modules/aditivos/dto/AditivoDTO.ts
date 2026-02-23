export type CreateAditivoDTO = {
  numeroAditivo?: number | null;
  tipoAditivo: 'PRAZO' | 'VALOR' | 'PRAZO_E_VALOR' | 'SUPRESSAO' | 'ACRESCIMO';
  dataAssinatura?: Date | null;
  novaVigencia?: Date | null;
  valorAcrescimo?: number | null;
  valorSupressao?: number | null;
  motivo?: string | null;
  justificativa?: string | null;
  observacoes?: string | null;
  convenioId: string;
};

export type UpdateAditivoDTO = Partial<Omit<CreateAditivoDTO, 'convenioId' | 'numeroAditivo'>>;
