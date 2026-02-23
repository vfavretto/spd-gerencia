export type CreateContratoDTO = {
  numProcessoLicitatorio?: string | null;
  modalidadeLicitacao?: 'PREGAO' | 'TOMADA_PRECOS' | 'CONCORRENCIA' | 'DISPENSA' | 'INEXIGIBILIDADE' | null;
  numeroContrato?: string | null;
  contratadaCnpj?: string | null;
  contratadaNome?: string | null;
  dataAssinatura?: Date | null;
  dataVigenciaInicio?: Date | null;
  dataVigenciaFim?: Date | null;
  dataOIS?: Date | null;
  valorContrato?: number | null;
  valorExecutado?: number | null;
  engenheiroResponsavel?: string | null;
  creaEngenheiro?: string | null;
  artRrt?: string | null;
  situacao?: string | null;
  observacoes?: string | null;
  convenioId: string;
};

export type UpdateContratoDTO = Partial<Omit<CreateContratoDTO, 'convenioId'>>;
