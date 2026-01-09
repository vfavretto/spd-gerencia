export type CreateFichaOrcamentariaDTO = {
  numero: string;
  tipo: 'REPASSE' | 'CONTRAPARTIDA' | 'EXCLUSIVO';
  descricao?: string;
  valor?: number;
  convenioId: string;
};

export type UpdateFichaOrcamentariaDTO = Partial<Omit<CreateFichaOrcamentariaDTO, 'convenioId'>>;
