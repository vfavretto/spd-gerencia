export type CreateMedicaoDTO = {
  numeroMedicao: number;
  dataMedicao: Date;
  percentualFisico?: number | null;
  valorMedido: number;
  dataPagamento?: Date | null;
  valorPago?: number | null;
  observacoes?: string | null;
  situacao?: string | null;
  processoMedicao?: string | null;
  contratoId: string;
};

export type UpdateMedicaoDTO = Partial<Omit<CreateMedicaoDTO, 'contratoId' | 'numeroMedicao'>>;
