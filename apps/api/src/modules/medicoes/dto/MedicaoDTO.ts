export type CreateMedicaoDTO = {
  numeroMedicao: number;
  dataMedicao: Date;
  percentualFisico?: number;
  valorMedido: number;
  dataPagamento?: Date | null;
  valorPago?: number;
  observacoes?: string;
  situacao?: string;
  contratoId: number;
};

export type UpdateMedicaoDTO = Partial<Omit<CreateMedicaoDTO, 'contratoId' | 'numeroMedicao'>>;

