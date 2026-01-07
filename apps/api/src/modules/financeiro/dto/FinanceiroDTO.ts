export type CreateFinanceiroDTO = {
  banco?: string;
  agencia?: string;
  contaBancaria?: string;
  valorLiberadoTotal?: number;
  saldoRendimentos?: number;
  fichasOrcamentarias?: string;
  observacoes?: string;
  convenioId: string;
};

export type UpdateFinanceiroDTO = Partial<Omit<CreateFinanceiroDTO, 'convenioId'>>;
