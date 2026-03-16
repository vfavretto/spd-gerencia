export type UsuarioRole = 'ADMIN' | 'ANALISTA' | 'ESTAGIARIO' | 'OBSERVADOR';

export interface User {
  id: string;
  nome: string;
  email: string;
  matricula: string;
  role: UsuarioRole;
}

export interface LoginResponse {
  token: string;
  usuario: User;
}

export interface RegisterUserDTO {
  nome: string;
  email: string;
  matricula: string;
  senha: string;
  role?: UsuarioRole;
}

export interface UserListItem {
  id: string;
  nome: string;
  email: string;
  matricula: string;
  role: UsuarioRole;
  ativo: boolean;
  criadoEm: string;
}

export type AcaoAuditoria = 'CREATE' | 'UPDATE' | 'DELETE';

export interface AuditLog {
  id: number;
  usuarioId: string;
  usuarioNome: string;
  usuarioEmail: string;
  acao: AcaoAuditoria;
  entidade: string;
  entidadeId: string;
  dadosAntigos?: Record<string, unknown> | null;
  dadosNovos?: Record<string, unknown> | null;
  ip?: string | null;
  userAgent?: string | null;
  criadoEm: string;
}

export interface AuditLogListResponse {
  data: AuditLog[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ConvenioSnapshot {
  id: string;
  convenioId: string;
  versao: number;
  dados: Record<string, unknown>;
  criadoPorId?: string | null;
  criadoPorNome?: string | null;
  motivoSnapshot?: string | null;
  criadoEm: string;
}

export interface SnapshotCompareResult {
  versao1: number;
  versao2: number;
  criadoEm1: string;
  criadoEm2: string;
  diferencas: {
    campo: string;
    valorAnterior: unknown;
    valorNovo: unknown;
  }[];
}

export type ConvenioStatus =
  | 'RASCUNHO'
  | 'EM_ANALISE'
  | 'APROVADO'
  | 'EM_EXECUCAO'
  | 'CONCLUIDO'
  | 'CANCELADO';

export type EsferaGoverno = 'FEDERAL' | 'ESTADUAL';

export type ModalidadeLicitacao =
  | 'PREGAO'
  | 'TOMADA_PRECOS'
  | 'CONCORRENCIA'
  | 'DISPENSA'
  | 'INEXIGIBILIDADE';

export type StatusPendencia = 'ABERTA' | 'EM_ANDAMENTO' | 'RESOLVIDA' | 'CANCELADA';

export type TipoAditivo = 'PRAZO' | 'VALOR' | 'PRAZO_E_VALOR' | 'SUPRESSAO' | 'ACRESCIMO';

export type TipoFichaOrcamentaria = 'REPASSE' | 'CONTRAPARTIDA' | 'EXCLUSIVO';
export type TipoEmpenho = 'REPASSE' | 'CONTRAPARTIDA' | 'EXCLUSIVO';

export interface Secretaria {
  id: string;
  _id?: string;
  nome: string;
  sigla?: string | null;
  responsavel?: string | null;
}

export interface OrgaoConcedente {
  id: string;
  _id?: string;
  nome: string;
  esfera?: string | null;
  contato?: string | null;
}

export interface Programa {
  id: string;
  _id?: string;
  nome: string;
  codigo?: string | null;
  descricao?: string | null;
}

export interface ModalidadeRepasseCatalogo {
  id: string;
  _id?: string;
  nome: string;
}

export interface TipoTermoFormalizacaoCatalogo {
  id: string;
  _id?: string;
  nome: string;
}

export interface Convenio {
  id: string;
  _id?: string;
  codigo: string;
  titulo: string;
  objeto: string;
  status: ConvenioStatus;
  descricao?: string | null;
  observacoes?: string | null;
  numeroProposta?: string | null;
  dataInicioProcesso?: string | null;
  modalidadeRepasseId?: string | null;
  termoFormalizacao?: string | null;
  numeroTermo?: string | null;
  clausulaSuspensiva?: boolean;
  esfera?: EsferaGoverno | null;
  ministerioOrgao?: string | null;
  objetoDescricao?: string | null;
  valorGlobal: string | number;
  valorRepasse?: string | number | null;
  valorContrapartida?: string | number | null;
  dataAssinatura?: string | null;
  dataInicioVigencia?: string | null;
  dataFimVigencia?: string | null;
  dataPrestacaoContas?: string | null;
  processoSPD?: string | null;
  processoCreditoAdicional?: string | null;
  area?: string | null;
  secretaria?: Secretaria;
  secretariaId?: string;
  orgao?: OrgaoConcedente | null;
  orgaoId?: string | null;
  programa?: Programa | null;
  programaId?: string | null;
  modalidadeRepasse?: ModalidadeRepasseCatalogo | null;
  tipoTermoFormalizacaoId?: string | null;
  tipoTermoFormalizacao?: TipoTermoFormalizacaoCatalogo | null;
  emendas?: EmendaParlamentar[];
  financeiroContas?: FinanceiroContas | null;
  contratos?: ContratoExecucao[];
  pendencias?: Pendencia[];
  aditivos?: Aditivo[];
  fichasOrcamentarias?: FichaOrcamentaria[];
  notasEmpenho?: NotaEmpenho[];
  criadoEm?: string;
  atualizadoEm?: string;
}

export type TipoComunicado = 'ENTRADA' | 'SAIDA';

export interface Comunicado {
  id: string;
  _id?: string;
  protocolo: string;
  assunto: string;
  conteudo?: string | null;
  tipo: TipoComunicado;
  dataRegistro: string;
  origem?: string | null;
  destino?: string | null;
  responsavel?: string | null;
  arquivoUrl?: string | null;
}

export type TipoEvento =
  | 'REUNIAO'
  | 'PRESTACAO_CONTAS'
  | 'ENTREGA_DOCUMENTOS'
  | 'VENCIMENTO_ETAPA'
  | 'OUTROS';

export type EventoOrigem = 'MANUAL' | 'PENDENCIA';

export interface EventoAgenda {
  id: string;
  _id?: string;
  titulo: string;
  descricao?: string | null;
  descricaoComplementar?: string | null;
  dataInicio: string;
  dataFim?: string | null;
  tipo: TipoEvento;
  origem: EventoOrigem;
  local?: string | null;
  responsavel?: string | null;
  concluidoEm?: string | null;
  convenioId?: string | null;
  pendenciaId?: string | null;
  convenio?: Convenio | null;
  pendencia?: Pendencia | null;
}

export interface DashboardOverview {
  totalConvenios: number;
  totalValor: number;
  comunicadosPendentes: number;
  proximasDatas: Array<{
    id: string;
    titulo: string;
    dataFimVigencia: string | null;
    status: ConvenioStatus;
  }>;
  porStatus: Array<{
    status: ConvenioStatus;
    _count: number;
  }>;
}

export interface DashboardResumo {
  totalPorEsfera: { esfera: string | null; total: number; quantidade: number }[];
  conveniosPorStatus: { status: ConvenioStatus; total: number }[];
  somaRepasses: number;
  somaContrapartidas: number;
  valorGlobalTotal: number;

  execucao: {
    valorTotalContratado: number;
    valorTotalMedido: number;
    valorTotalPago: number;
    percentualMedido: number;
    percentualPago: number;
  };

  pendencias: {
    abertas: number;
    emAndamento: number;
    vencidasHoje: number;
    total: number;
  };

  contratos: {
    total: number;
    emExecucao: number;
    concluidos: number;
    valorTotal: number;
  };

  alertas: {
    conveniosVencendo30Dias: number;
    conveniosSemMedicao60Dias: number;
    pendenciasAtrasadas: number;
    contratosSemMedicaoRecente: number;
  };

  topConvenios: {
    id: string;
    codigo: string;
    titulo: string;
    valorGlobal: number;
    status: ConvenioStatus;
    percentualExecutado: number;
  }[];
}

export interface Catalogs {
  secretarias: Secretaria[];
  orgaos: OrgaoConcedente[];
  programas: Programa[];
  modalidadesRepasse: ModalidadeRepasseCatalogo[];
  tiposTermoFormalizacao: TipoTermoFormalizacaoCatalogo[];
}

export interface EmendaParlamentar {
  id: string;
  _id?: string;
  nomeParlamentar: string;
  partido?: string | null;
  codigoEmenda?: string | null;
  funcao?: string | null;
  subfuncao?: string | null;
  programa?: string | null;
  valorIndicado?: string | number | null;
  anoEmenda?: number | null;
  convenioId: string;
}

export type CreateEmendaDTO = Omit<EmendaParlamentar, 'id' | '_id' | 'convenioId'>;
export type UpdateEmendaDTO = Partial<CreateEmendaDTO>;

export interface FinanceiroContas {
  id: string;
  _id?: string;
  banco?: string | null;
  agencia?: string | null;
  contaBancaria?: string | null;
  valorLiberadoTotal?: string | number | null;
  saldoRendimentos?: string | number | null;
  fichasOrcamentarias?: string | null;
  observacoes?: string | null;
  codigoReceita?: string | null;
  dataDeposito?: string | null;
  ajusteRepasseVigente?: string | number | null;
  ajusteContrapartidaVigente?: string | number | null;
  convenioId: string;
}

export type UpsertFinanceiroDTO = Omit<FinanceiroContas, 'id' | '_id' | 'convenioId'>;

export interface ContratoExecucao {
  id: string;
  _id?: string;
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
  cno?: string | null;
  prazoExecucaoDias?: number | null;
  dataTerminoExecucao?: string | null;
  valorCPExclusiva?: string | number | null;
  convenioId: string;
  medicoes?: Medicao[];
}

export type CreateContratoDTO = Omit<ContratoExecucao, 'id' | '_id' | 'convenioId' | 'medicoes'>;
export type UpdateContratoDTO = Partial<CreateContratoDTO>;

export interface Medicao {
  id: string;
  _id?: string;
  numeroMedicao: number;
  dataMedicao: string;
  percentualFisico?: string | number | null;
  valorMedido: string | number;
  dataPagamento?: string | null;
  valorPago?: string | number | null;
  observacoes?: string | null;
  situacao?: string | null;
  processoMedicao?: string | null;
  contratoId: string;
}

export type CreateMedicaoDTO = Omit<Medicao, 'id' | '_id' | 'contratoId'>;
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
  id: string;
  _id?: string;
  descricao: string;
  responsavel?: string | null;
  prazo?: string | null;
  status: StatusPendencia;
  prioridade?: number | null;
  resolucao?: string | null;
  dataResolucao?: string | null;
  orgaoResponsavel?: string | null;
  convenioId: string;
  criadoPorId?: string | null;
  criadoPor?: { id: string; nome: string } | null;
  eventoAgenda?: EventoAgenda | null;
  criadoEm?: string;
}

export type CreatePendenciaDTO = Omit<Pendencia, 'id' | '_id' | 'convenioId' | 'criadoPorId' | 'criadoPor' | 'criadoEm'>;
export type UpdatePendenciaDTO = Partial<CreatePendenciaDTO>;

export interface Aditivo {
  id: string;
  _id?: string;
  numeroAditivo: number;
  tipoAditivo: TipoAditivo;
  dataAssinatura?: string | null;
  novaVigencia?: string | null;
  valorAcrescimo?: string | number | null;
  valorSupressao?: string | number | null;
  motivo?: string | null;
  justificativa?: string | null;
  observacoes?: string | null;
  convenioId: string;
  contratoId?: string | null;
}

export type CreateAditivoDTO = Omit<Aditivo, 'id' | '_id' | 'convenioId'>;
export type UpdateAditivoDTO = Partial<Omit<CreateAditivoDTO, 'numeroAditivo'>>;

export interface VigenciaInfo {
  vigenciaAtual: string | null;
  vigenciaExpirada: boolean;
  diasRestantes: number | null;
}

export interface FichaOrcamentaria {
  id: string;
  _id?: string;
  numero: string;
  tipo: TipoFichaOrcamentaria;
  descricao?: string | null;
  valor?: string | number | null;
  convenioId: string;
  criadoEm?: string;
}

export type CreateFichaOrcamentariaDTO = Omit<FichaOrcamentaria, 'id' | '_id' | 'convenioId' | 'criadoEm'>;
export type UpdateFichaOrcamentariaDTO = Partial<CreateFichaOrcamentariaDTO>;

export interface NotaEmpenho {
  id: string;
  _id?: string;
  numero: string;
  tipo: TipoEmpenho;
  valor: string | number;
  dataEmissao: string;
  observacoes?: string | null;
  convenioId: string;
  criadoEm?: string;
}

export type CreateNotaEmpenhoDTO = Omit<NotaEmpenho, 'id' | '_id' | 'convenioId' | 'criadoEm'>;
export type UpdateNotaEmpenhoDTO = Partial<CreateNotaEmpenhoDTO>;

export interface ValoresVigentes {
  valorGlobal: number;
  valorRepasseOriginal: number;
  valorContrapartidaOriginal: number;
  valorRepasseVigente: number;
  valorContrapartidaVigente: number;
  valorGlobalVigente: number;
  totalAcrescimos: number;
  totalSupressoes: number;
  valorTotalContratado: number;
  valorTotalMedido: number;
  valorTotalPago: number;
  saldoRepasse: number;
  saldoContrapartida: number;
  saldoAContratar: number;
  saldoConvenio: number;
  saldoExecucao: number;
  totalCPExclusiva: number;
  percentualExecutado: number;
  percentualPago: number;
  dataUltimaMedicao: string | null;
  diasSemMedicao: number | null;
}
