export type CreateConvenioDTO = {
  codigo: string;
  titulo: string;
  objeto: string;
  descricao?: string | null;
  observacoes?: string | null;
  valorGlobal: number;
  valorRepasse?: number | null;
  valorContrapartida?: number | null;
  dataAssinatura?: Date | null;
  dataInicioVigencia?: Date | null;
  dataFimVigencia?: Date | null;
  dataPrestacaoContas?: Date | null;
  status?: 'RASCUNHO' | 'EM_ANALISE' | 'APROVADO' | 'EM_EXECUCAO' | 'CONCLUIDO' | 'CANCELADO';
  numeroProposta?: string | null;
  numeroTermo?: string | null;
  esfera?: 'FEDERAL' | 'ESTADUAL' | null;
  modalidadeRepasseId?: string | null;
  tipoTermoFormalizacaoId?: string | null;
  processoSPD?: string | null;
  processoCreditoAdicional?: string | null;
  area?: string | null;
  secretariaId: string;
  orgaoId?: string | null;
  programaId?: string | null;
};

export type UpdateConvenioDTO = Partial<CreateConvenioDTO>;
