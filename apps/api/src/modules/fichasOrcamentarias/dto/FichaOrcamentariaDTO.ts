export type CreateFichaOrcamentariaDTO = {
  numero: string;
  tipo: 'REPASSE' | 'CONTRAPARTIDA' | 'EXCLUSIVO';
  descricao?: string | null;
  valor?: number | null;
  convenioId: string;
};

export type UpdateFichaOrcamentariaDTO = Partial<Omit<CreateFichaOrcamentariaDTO, 'convenioId'>>;
