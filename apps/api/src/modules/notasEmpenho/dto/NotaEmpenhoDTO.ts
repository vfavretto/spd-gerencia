export type CreateNotaEmpenhoDTO = {
  numero: string;
  tipo: 'REPASSE' | 'CONTRAPARTIDA' | 'EXCLUSIVO';
  valor: number;
  dataEmissao: Date | string;
  observacoes?: string | null;
  convenioId: string;
};

export type UpdateNotaEmpenhoDTO = Partial<Omit<CreateNotaEmpenhoDTO, 'convenioId'>>;
