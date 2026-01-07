export type CreateAditivoDTO = {
  numeroAditivo?: number;
  tipoAditivo: 'PRAZO' | 'VALOR' | 'PRAZO_E_VALOR' | 'SUPRESSAO' | 'ACRESCIMO';
  dataAssinatura?: Date | null;
  novaVigencia?: Date | null;
  valorAcrescimo?: number;
  valorSupressao?: number;
  motivo?: string;
  justificativa?: string;
  observacoes?: string;
  convenioId: string;
};

export type UpdateAditivoDTO = Partial<Omit<CreateAditivoDTO, 'convenioId' | 'numeroAditivo'>>;
