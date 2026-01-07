export type CreateContratoDTO = {
  numProcessoLicitatorio?: string;
  modalidadeLicitacao?: 'PREGAO' | 'TOMADA_PRECOS' | 'CONCORRENCIA' | 'DISPENSA' | 'INEXIGIBILIDADE';
  numeroContrato?: string;
  contratadaCnpj?: string;
  contratadaNome?: string;
  dataAssinatura?: Date | null;
  dataVigenciaInicio?: Date | null;
  dataVigenciaFim?: Date | null;
  dataOIS?: Date | null;
  valorContrato?: number;
  valorExecutado?: number;
  engenheiroResponsavel?: string;
  creaEngenheiro?: string;
  artRrt?: string;
  situacao?: string;
  observacoes?: string;
  convenioId: string;
};

export type UpdateContratoDTO = Partial<Omit<CreateContratoDTO, 'convenioId'>>;
