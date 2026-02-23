export type CreateEmendaDTO = {
  nomeParlamentar: string;
  partido?: string | null;
  codigoEmenda?: string | null;
  funcao?: string | null;
  subfuncao?: string | null;
  programa?: string | null;
  valorIndicado?: number | null;
  anoEmenda?: number | null;
  convenioId: string;
};

export type UpdateEmendaDTO = Partial<Omit<CreateEmendaDTO, 'convenioId'>>;
