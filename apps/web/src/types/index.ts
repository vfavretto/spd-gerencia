export type UsuarioRole = 'ADMINISTRADOR' | 'ANALISTA' | 'VISUALIZADOR';

export interface User {
  id: number;
  nome: string;
  email: string;
  role: UsuarioRole;
}

export interface LoginResponse {
  token: string;
  usuario: User;
}

export type ConvenioStatus =
  | 'RASCUNHO'
  | 'EM_ANALISE'
  | 'APROVADO'
  | 'EM_EXECUCAO'
  | 'CONCLUIDO'
  | 'CANCELADO';

export type ModalidadeRepasse =
  | 'CONVENIO'
  | 'CONTRATO_REPASSE'
  | 'TERMO_FOMENTO'
  | 'TERMO_COLABORACAO';

export type EsferaGoverno = 'FEDERAL' | 'ESTADUAL';

export type ModalidadeLicitacao =
  | 'PREGAO'
  | 'TOMADA_PRECOS'
  | 'CONCORRENCIA'
  | 'DISPENSA'
  | 'INEXIGIBILIDADE';

export type StatusPendencia = 'ABERTA' | 'EM_ANDAMENTO' | 'RESOLVIDA' | 'CANCELADA';

export type TipoAditivo = 'PRAZO' | 'VALOR' | 'PRAZO_E_VALOR' | 'SUPRESSAO' | 'ACRESCIMO';

export interface Secretaria {
  id: number;
  nome: string;
  sigla?: string | null;
  responsavel?: string | null;
}

export interface OrgaoConcedente {
  id: number;
  nome: string;
  esfera?: string | null;
  contato?: string | null;
}

export interface Programa {
  id: number;
  nome: string;
  codigo?: string | null;
  descricao?: string | null;
}

export interface FonteRecurso {
  id: number;
  nome: string;
  tipo?: string | null;
}

export interface Convenio {
  id: number;
  codigo: string;
  titulo: string;
  objeto: string;
  status: ConvenioStatus;
  descricao?: string | null;
  observacoes?: string | null;
  // Novos campos de identificação
  numeroProposta?: string | null;
  dataInicioProcesso?: string | null;
  modalidadeRepasse?: ModalidadeRepasse | null;
  termoFormalizacao?: string | null;
  numeroTermo?: string | null;
  clausulaSuspensiva?: boolean;
  esfera?: EsferaGoverno | null;
  ministerioOrgao?: string | null;
  objetoDescricao?: string | null;
  // Valores financeiros
  valorGlobal: string | number;
  valorRepasse?: string | number | null;
  valorContrapartida?: string | number | null;
  // Datas
  dataAssinatura?: string | null;
  dataInicioVigencia?: string | null;
  dataFimVigencia?: string | null;
  dataPrestacaoContas?: string | null;
  // Relacionamentos
  secretaria?: Secretaria;
  orgao?: OrgaoConcedente | null;
  programa?: Programa | null;
  fonte?: FonteRecurso | null;
  emendas?: EmendaParlamentar[];
  financeiroContas?: FinanceiroContas | null;
  contratos?: ContratoExecucao[];
  pendencias?: Pendencia[];
  aditivos?: Aditivo[];
}

export type TipoComunicado = 'ENTRADA' | 'SAIDA';

export interface Comunicado {
  id: number;
  protocolo: string;
  assunto: string;
  conteudo?: string | null;
  tipo: TipoComunicado;
  status?: string | null;
  dataRegistro: string;
  origem?: string | null;
  destino?: string | null;
  responsavel?: string | null;
  convenioId?: number | null;
  convenio?: Convenio | null;
}

export type TipoEvento =
  | 'REUNIAO'
  | 'PRESTACAO_CONTAS'
  | 'ENTREGA_DOCUMENTOS'
  | 'VENCIMENTO_ETAPA'
  | 'OUTROS';

export interface EventoAgenda {
  id: number;
  titulo: string;
  descricao?: string | null;
  dataInicio: string;
  dataFim?: string | null;
  tipo: TipoEvento;
  local?: string | null;
  responsavel?: string | null;
  convenio?: Convenio | null;
}

export interface DashboardOverview {
  totalConvenios: number;
  totalValor: number;
  comunicadosPendentes: number;
  proximasDatas: Array<{
    id: number;
    titulo: string;
    dataFimVigencia: string | null;
    status: ConvenioStatus;
  }>;
  porStatus: Array<{
    status: ConvenioStatus;
    _count: number;
  }>;
}

export interface Catalogs {
  secretarias: Secretaria[];
  orgaos: OrgaoConcedente[];
  programas: Programa[];
  fontes: FonteRecurso[];
}

// ==================== NOVAS INTERFACES ====================

export interface EmendaParlamentar {
  id: number;
  nomeParlamentar: string;
  partido?: string | null;
  codigoEmenda?: string | null;
  funcao?: string | null;
  subfuncao?: string | null;
  programa?: string | null;
  valorIndicado?: string | number | null;
  anoEmenda?: number | null;
  convenioId: number;
}

export type CreateEmendaDTO = Omit<EmendaParlamentar, 'id' | 'convenioId'>;
export type UpdateEmendaDTO = Partial<CreateEmendaDTO>;

export interface FinanceiroContas {
  id: number;
  banco?: string | null;
  agencia?: string | null;
  contaBancaria?: string | null;
  valorLiberadoTotal?: string | number | null;
  saldoRendimentos?: string | number | null;
  fichasOrcamentarias?: string | null;
  observacoes?: string | null;
  convenioId: number;
}

export type UpsertFinanceiroDTO = Omit<FinanceiroContas, 'id' | 'convenioId'>;

export interface ContratoExecucao {
  id: number;
  numProcessoLicitatorio?: string | null;
  modalidadeLicitacao?: ModalidadeLicitacao | null;
  numeroContrato?: string | null;
  contratadaCnpj?: string | null;
  contratadaNome?: string | null;
  dataAssinatura?: string | null;
  dataVigenciaInicio?: string | null;
  dataVigenciaFim?: string | null;
  dataOIS?: string | null;
  valorContrato?: string | number | null;
  valorExecutado?: string | number | null;
  engenheiroResponsavel?: string | null;
  creaEngenheiro?: string | null;
  artRrt?: string | null;
  situacao?: string | null;
  observacoes?: string | null;
  convenioId: number;
  medicoes?: Medicao[];
}

export type CreateContratoDTO = Omit<ContratoExecucao, 'id' | 'convenioId' | 'medicoes'>;
export type UpdateContratoDTO = Partial<CreateContratoDTO>;

export interface Medicao {
  id: number;
  numeroMedicao: number;
  dataMedicao: string;
  percentualFisico?: string | number | null;
  valorMedido: string | number;
  dataPagamento?: string | null;
  valorPago?: string | number | null;
  observacoes?: string | null;
  situacao?: string | null;
  contratoId: number;
}

export type CreateMedicaoDTO = Omit<Medicao, 'id' | 'contratoId'>;
export type UpdateMedicaoDTO = Partial<Omit<CreateMedicaoDTO, 'numeroMedicao'>>;

export interface SaldoContrato {
  valorContrato: number;
  totalMedido: number;
  totalPago: number;
  saldoMedir: number;
  saldoPagar: number;
  percentualExecutado: number;
}

export interface Pendencia {
  id: number;
  descricao: string;
  responsavel?: string | null;
  prazo?: string | null;
  status: StatusPendencia;
  prioridade?: number | null;
  resolucao?: string | null;
  dataResolucao?: string | null;
  convenioId: number;
  criadoPorId?: number | null;
  criadoPor?: { id: number; nome: string } | null;
  criadoEm?: string;
}

export type CreatePendenciaDTO = Omit<Pendencia, 'id' | 'convenioId' | 'criadoPorId' | 'criadoPor' | 'criadoEm'>;
export type UpdatePendenciaDTO = Partial<CreatePendenciaDTO>;

export interface Aditivo {
  id: number;
  numeroAditivo: number;
  tipoAditivo: TipoAditivo;
  dataAssinatura?: string | null;
  novaVigencia?: string | null;
  valorAcrescimo?: string | number | null;
  valorSupressao?: string | number | null;
  motivo?: string | null;
  justificativa?: string | null;
  observacoes?: string | null;
  convenioId: number;
}

export type CreateAditivoDTO = Omit<Aditivo, 'id' | 'convenioId'>;
export type UpdateAditivoDTO = Partial<Omit<CreateAditivoDTO, 'numeroAditivo'>>;

export interface VigenciaInfo {
  vigenciaAtual: string | null;
  vigenciaExpirada: boolean;
  diasRestantes: number | null;
}
