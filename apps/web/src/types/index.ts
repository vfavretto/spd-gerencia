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
  valorGlobal: string | number;
  valorRepasse?: string | number | null;
  valorContrapartida?: string | number | null;
  dataAssinatura?: string | null;
  dataInicioVigencia?: string | null;
  dataFimVigencia?: string | null;
  secretaria?: Secretaria;
  orgao?: OrgaoConcedente | null;
  programa?: Programa | null;
  fonte?: FonteRecurso | null;
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
