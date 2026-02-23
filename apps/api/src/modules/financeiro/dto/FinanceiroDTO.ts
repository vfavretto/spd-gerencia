export type CreateFinanceiroDTO = {
  banco?: string | null;
  agencia?: string | null;
  contaBancaria?: string | null;
  valorLiberadoTotal?: number | null;
  saldoRendimentos?: number | null;
  fichasOrcamentarias?: string | null;
  observacoes?: string | null;
  convenioId: string;
};

export type UpdateFinanceiroDTO = Partial<Omit<CreateFinanceiroDTO, 'convenioId'>>;
