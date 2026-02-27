export type CreateEventoDTO = {
  titulo: string;
  descricao?: string | null;
  tipo?: 'REUNIAO' | 'PRESTACAO_CONTAS' | 'ENTREGA_DOCUMENTOS' | 'VENCIMENTO_ETAPA' | 'OUTROS' | null;
  dataInicio: Date;
  dataFim?: Date | null;
  local?: string | null;
  responsavel?: string | null;
  convenioId?: string | null;
};

export type UpdateEventoDTO = Partial<CreateEventoDTO>;
