import type { Types, Document } from 'mongoose';
import type {
  UsuarioRole,
  ConvenioStatus,
  TipoComunicado,
  TipoEvento,
  ModalidadeRepasse,
  EsferaGoverno,
  ModalidadeLicitacao,
  StatusPendencia,
  TipoAditivo,
  TipoFichaOrcamentaria,
  TipoEmpenho
} from './enums';

// ==================== BASE INTERFACES ====================

export interface BaseDocument extends Document {
  _id: Types.ObjectId;
  criadoEm: Date;
  atualizadoEm: Date;
}

// ==================== USUARIO ====================

export interface IUsuario extends BaseDocument {
  nome: string;
  email: string;
  senha: string;
  role: UsuarioRole;
  ativo: boolean;
}

// ==================== SECRETARIA ====================

export interface ISecretaria extends BaseDocument {
  nome: string;
  sigla?: string | null;
  responsavel?: string | null;
}

// ==================== ORGAO CONCEDENTE ====================

export interface IOrgaoConcedente extends BaseDocument {
  nome: string;
  esfera?: string | null;
  contato?: string | null;
}

// ==================== PROGRAMA ====================

export interface IPrograma extends BaseDocument {
  nome: string;
  codigo?: string | null;
  descricao?: string | null;
}

// ==================== FONTE RECURSO ====================

export interface IFonteRecurso extends BaseDocument {
  nome: string;
  tipo?: string | null;
}

// ==================== CONVENIO ANEXO ====================

export interface IConvenioAnexo {
  _id: Types.ObjectId;
  nome: string;
  url: string;
  tipo?: string | null;
  criadoEm: Date;
}

// ==================== ETAPA CONVENIO ====================

export interface IEtapaConvenio {
  _id: Types.ObjectId;
  titulo: string;
  descricao?: string | null;
  dataPrevista?: Date | null;
  dataRealizada?: Date | null;
  responsavel?: string | null;
  situacao?: string | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

// ==================== EMENDA PARLAMENTAR ====================

export interface IEmendaParlamentar extends BaseDocument {
  nomeParlamentar: string;
  partido?: string | null;
  codigoEmenda?: string | null;
  funcao?: string | null;
  subfuncao?: string | null;
  programa?: string | null;
  valorIndicado?: number | null;
  anoEmenda?: number | null;
  convenioId: Types.ObjectId;
}

// ==================== FINANCEIRO CONTAS ====================

export interface IFinanceiroContas extends BaseDocument {
  banco?: string | null;
  agencia?: string | null;
  contaBancaria?: string | null;
  valorLiberadoTotal?: number | null;
  saldoRendimentos?: number | null;
  fichasOrcamentarias?: string | null;
  observacoes?: string | null;
  // Novos campos
  codigoReceita?: string | null;
  dataDeposito?: Date | null;
  valorCPExclusiva?: number | null;
  convenioId: Types.ObjectId;
}

// ==================== FICHA ORCAMENTARIA ====================

export interface IFichaOrcamentaria extends BaseDocument {
  numero: string;
  tipo: TipoFichaOrcamentaria;
  descricao?: string | null;
  valor?: number | null;
  convenioId: Types.ObjectId;
}

// ==================== NOTA EMPENHO ====================

export interface INotaEmpenho extends BaseDocument {
  numero: string;
  tipo: TipoEmpenho;
  valor: number;
  dataEmissao: Date;
  observacoes?: string | null;
  convenioId: Types.ObjectId;
}

// ==================== MEDICAO ====================

export interface IMedicao extends BaseDocument {
  numeroMedicao: number;
  dataMedicao: Date;
  percentualFisico?: number | null;
  valorMedido: number;
  dataPagamento?: Date | null;
  valorPago?: number | null;
  observacoes?: string | null;
  situacao?: string | null;
  processoMedicao?: string | null;
  contratoId: Types.ObjectId;
}

// ==================== CONTRATO EXECUCAO ====================

export interface IContratoExecucao extends BaseDocument {
  numProcessoLicitatorio?: string | null;
  modalidadeLicitacao?: ModalidadeLicitacao | null;
  numeroContrato?: string | null;
  contratadaCnpj?: string | null;
  contratadaNome?: string | null;
  dataAssinatura?: Date | null;
  dataVigenciaInicio?: Date | null;
  dataVigenciaFim?: Date | null;
  dataOIS?: Date | null;
  valorContrato?: number | null;
  valorExecutado?: number | null;
  engenheiroResponsavel?: string | null;
  creaEngenheiro?: string | null;
  artRrt?: string | null;
  situacao?: string | null;
  observacoes?: string | null;
  // Novos campos
  cno?: string | null;
  prazoExecucaoDias?: number | null;
  dataTerminoExecucao?: Date | null;
  convenioId: Types.ObjectId;
  // Virtual populate
  medicoes?: IMedicao[];
}

// ==================== PENDENCIA ====================

export interface IPendencia extends BaseDocument {
  descricao: string;
  responsavel?: string | null;
  prazo?: Date | null;
  status: StatusPendencia;
  prioridade?: number | null;
  resolucao?: string | null;
  dataResolucao?: Date | null;
  orgaoResponsavel?: string | null;
  convenioId: Types.ObjectId;
  criadoPorId?: Types.ObjectId | null;
  // Virtual populate
  criadoPor?: IUsuario | null;
}

// ==================== ADITIVO ====================

export interface IAditivo extends BaseDocument {
  numeroAditivo: number;
  tipoAditivo: TipoAditivo;
  dataAssinatura?: Date | null;
  novaVigencia?: Date | null;
  valorAcrescimo?: number | null;
  valorSupressao?: number | null;
  motivo?: string | null;
  justificativa?: string | null;
  observacoes?: string | null;
  convenioId: Types.ObjectId;
}

// ==================== COMUNICADO ====================

export interface IComunicado extends BaseDocument {
  protocolo: string;
  assunto: string;
  conteudo?: string | null;
  tipo: TipoComunicado;
  status?: string | null;
  dataRegistro: Date;
  origem?: string | null;
  destino?: string | null;
  responsavel?: string | null;
  arquivoUrl?: string | null;
  convenioId?: Types.ObjectId | null;
  criadoPorId?: Types.ObjectId | null;
  // Virtual populate
  convenio?: IConvenio | null;
  criadoPor?: IUsuario | null;
}

// ==================== EVENTO AGENDA ====================

export interface IEventoAgenda extends BaseDocument {
  titulo: string;
  descricao?: string | null;
  tipo: TipoEvento;
  dataInicio: Date;
  dataFim?: Date | null;
  local?: string | null;
  responsavel?: string | null;
  convenioId?: Types.ObjectId | null;
  // Virtual populate
  convenio?: IConvenio | null;
}

// ==================== CONVENIO ====================

export interface IConvenio extends BaseDocument {
  codigo: string;
  titulo: string;
  objeto: string;
  status: ConvenioStatus;
  descricao?: string | null;
  observacoes?: string | null;
  
  // Campos de identificação
  numeroProposta?: string | null;
  dataInicioProcesso?: Date | null;
  modalidadeRepasse?: ModalidadeRepasse | null;
  termoFormalizacao?: string | null;
  numeroTermo?: string | null;
  clausulaSuspensiva: boolean;
  esfera?: EsferaGoverno | null;
  ministerioOrgao?: string | null;
  objetoDescricao?: string | null;
  
  // Valores financeiros
  valorGlobal: number;
  valorRepasse?: number | null;
  valorContrapartida?: number | null;
  
  // Datas importantes
  dataAssinatura?: Date | null;
  dataInicioVigencia?: Date | null;
  dataFimVigencia?: Date | null;
  dataPrestacaoContas?: Date | null;

  // Campos de processo
  processoSPD?: string | null;
  processoCreditoAdicional?: string | null;
  area?: string | null;
  
  // Relacionamentos (referencias)
  secretariaId: Types.ObjectId;
  orgaoId?: Types.ObjectId | null;
  programaId?: Types.ObjectId | null;
  fonteId?: Types.ObjectId | null;
  
  // Subdocumentos embedded
  anexos: IConvenioAnexo[];
  etapas: IEtapaConvenio[];
  
  // Virtual populate
  secretaria?: ISecretaria;
  orgao?: IOrgaoConcedente | null;
  programa?: IPrograma | null;
  fonte?: IFonteRecurso | null;
  emendas?: IEmendaParlamentar[];
  financeiroContas?: IFinanceiroContas | null;
  contratos?: IContratoExecucao[];
  pendencias?: IPendencia[];
  aditivos?: IAditivo[];
  fichasOrcamentarias?: IFichaOrcamentaria[];
  notasEmpenho?: INotaEmpenho[];
}

