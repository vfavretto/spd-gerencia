export type CreateEmendaDTO = {
  nomeParlamentar: string;
  partido?: string;
  codigoEmenda?: string;
  funcao?: string;
  subfuncao?: string;
  programa?: string;
  valorIndicado?: number;
  anoEmenda?: number;
  convenioId: number;
};

export type UpdateEmendaDTO = Partial<Omit<CreateEmendaDTO, 'convenioId'>>;

