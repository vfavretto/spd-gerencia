export type CreateEventoDTO = {
  titulo: string;
  descricao?: string;
  tipo?: 'REUNIAO' | 'PRESTACAO_CONTAS' | 'ENTREGA_DOCUMENTOS' | 'VENCIMENTO_ETAPA' | 'OUTROS';
  dataInicio: Date;
  dataFim?: Date | null;
  local?: string;
  responsavel?: string;
  convenioId?: string | null;
};

export type UpdateEventoDTO = Partial<CreateEventoDTO>;
