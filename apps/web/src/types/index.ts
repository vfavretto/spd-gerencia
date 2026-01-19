export type UsuarioRole = 'ADMINISTRADOR' | 'ANALISTA' | 'VISUALIZADOR';

export interface User {
  id: string;
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

export interface FonteRecurso {
  id: string;
  _id?: string;
  nome: string;
  tipo?: string | null;
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
  // Campos de processo
  processoSPD?: string | null;
  processoCreditoAdicional?: string | null;
  area?: string | null;
  // Relacionamentos
  secretaria?: Secretaria;
  secretariaId?: string;
  orgao?: OrgaoConcedente | null;
  orgaoId?: string | null;
  programa?: Programa | null;
  programaId?: string | null;
  fonte?: FonteRecurso | null;
  fonteId?: string | null;
  emendas?: EmendaParlamentar[];
  financeiroContas?: FinanceiroContas | null;
  contratos?: ContratoExecucao[];
  pendencias?: Pendencia[];
  aditivos?: Aditivo[];
  fichasOrcamentarias?: FichaOrcamentaria[];
  notasEmpenho?: NotaEmpenho[];
}

export type TipoComunicado = 'ENTRADA' | 'SAIDA';

export interface Comunicado {
  id: string;
  _id?: string;
  protocolo: string;
  assunto: string;
  conteudo?: string | null;
  tipo: TipoComunicado;
  status?: string | null;
  dataRegistro: string;
  origem?: string | null;
  destino?: string | null;
  responsavel?: string | null;
  convenioId?: string | null;
  convenio?: Convenio | null;
}

export type TipoEvento =
  | 'REUNIAO'
  | 'PRESTACAO_CONTAS'
  | 'ENTREGA_DOCUMENTOS'
  | 'VENCIMENTO_ETAPA'
  | 'OUTROS';

export interface EventoAgenda {
  id: string;
  _id?: string;
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
  // Visão financeira
  totalPorEsfera: { esfera: string | null; total: number; quantidade: number }[];
  conveniosPorStatus: { status: string; total: number }[];
  somaRepasses: number;
  somaContrapartidas: number;
  valorGlobalTotal: number;
  
  // Execução
  execucao: {
    valorTotalContratado: number;
    valorTotalMedido: number;
    valorTotalPago: number;
    percentualMedido: number;
    percentualPago: number;
  };
  
  // Pendências
  pendencias: {
    abertas: number;
    emAndamento: number;
    vencidasHoje: number;
    total: number;
  };
  
  // Contratos
  contratos: {
    total: number;
    emExecucao: number;
    concluidos: number;
    valorTotal: number;
  };
  
  // Alertas
  alertas: {
    conveniosVencendo30Dias: number;
    conveniosSemMedicao60Dias: number;
    pendenciasAtrasadas: number;
    contratosSemMedicaoRecente: number;
  };
  
  // Top convênios por valor
  topConvenios: {
    id: string;
    codigo: string;
    titulo: string;
    valorGlobal: number;
    status: string;
    percentualExecutado: number;
  }[];
}

export interface Catalogs {
  secretarias: Secretaria[];
  orgaos: OrgaoConcedente[];
  programas: Programa[];
  fontes: FonteRecurso[];
}

// ==================== NOVAS INTERFACES ====================

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
  // Novos campos
  codigoReceita?: string | null;
  dataDeposito?: string | null;
  valorCPExclusiva?: string | number | null;
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
  // Novos campos
  cno?: string | null;
  prazoExecucaoDias?: number | null;
  dataTerminoExecucao?: string | null;
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
}

export type CreateAditivoDTO = Omit<Aditivo, 'id' | '_id' | 'convenioId'>;
export type UpdateAditivoDTO = Partial<Omit<CreateAditivoDTO, 'numeroAditivo'>>;

export interface VigenciaInfo {
  vigenciaAtual: string | null;
  vigenciaExpirada: boolean;
  diasRestantes: number | null;
}

// ==================== NOVAS INTERFACES (PLANILHA) ====================

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
  // Valores originais
  valorGlobal: number;
  valorRepasseOriginal: number;
  valorContrapartidaOriginal: number;
  
  // Valores após aditivos
  valorRepasseVigente: number;
  valorContrapartidaVigente: number;
  valorGlobalVigente: number;
  
  // Valores de aditivos
  totalAcrescimos: number;
  totalSupressoes: number;
  
  // Valores executados
  valorTotalContratado: number;
  valorTotalMedido: number;
  valorTotalPago: number;
  
  // Saldos
  saldoRepasse: number;
  saldoContrapartida: number;
  saldoAContratar: number;
  
  // Percentuais
  percentualExecutado: number;
  percentualPago: number;
  
  // Última medição
  dataUltimaMedicao: string | null;
  diasSemMedicao: number | null;
}
