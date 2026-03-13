export type CreateEventoDTO = {
  titulo: string;
  descricao?: string | null;
  descricaoComplementar?: string | null;
  tipo?: 'REUNIAO' | 'PRESTACAO_CONTAS' | 'ENTREGA_DOCUMENTOS' | 'VENCIMENTO_ETAPA' | 'OUTROS' | null;
  dataInicio: Date;
  dataFim?: Date | null;
  local?: string | null;
  responsavel?: string | null;
  convenioId?: string | null;
  pendenciaId?: string | null;
};

export type UpdateEventoDTO = Partial<CreateEventoDTO>;
