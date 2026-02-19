export type CreateComunicadoDTO = {
  protocolo: string;
  assunto: string;
  conteudo?: string | null;
  tipo: 'ENTRADA' | 'SAIDA';
  dataRegistro?: Date;
  origem?: string | null;
  destino?: string | null;
  responsavel?: string | null;
  arquivoUrl?: string | null;
};

export type UpdateComunicadoDTO = Partial<CreateComunicadoDTO>;

export type ComunicadoFilters = {
  tipo?: 'ENTRADA' | 'SAIDA';
  search?: string;
  responsavel?: string;
  dataInicio?: string;
  dataFim?: string;
};
