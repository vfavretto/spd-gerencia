import type { ConvenioStatus, TipoComunicado, TipoEvento } from '../types';

type Option<T> = {
  label: string;
  value: T;
};

export const convenioStatusOptions: Option<ConvenioStatus>[] = [
  { label: 'Rascunho', value: 'RASCUNHO' },
  { label: 'Em análise', value: 'EM_ANALISE' },
  { label: 'Aprovado', value: 'APROVADO' },
  { label: 'Em execução', value: 'EM_EXECUCAO' },
  { label: 'Concluído', value: 'CONCLUIDO' },
  { label: 'Cancelado', value: 'CANCELADO' }
];

export const tipoComunicadoOptions: Option<TipoComunicado>[] = [
  { label: 'Entrada', value: 'ENTRADA' },
  { label: 'Saída', value: 'SAIDA' }
];

export const tipoEventoOptions: Option<TipoEvento>[] = [
  { label: 'Reunião', value: 'REUNIAO' },
  { label: 'Prestação de contas', value: 'PRESTACAO_CONTAS' },
  { label: 'Entrega de documentos', value: 'ENTREGA_DOCUMENTOS' },
  { label: 'Vencimento de etapa', value: 'VENCIMENTO_ETAPA' },
  { label: 'Outros', value: 'OUTROS' }
];

export const statusColors: Record<
  ConvenioStatus,
  { bg: string; text: string; label: string }
> = {
  RASCUNHO: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Rascunho' },
  EM_ANALISE: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Em análise' },
  APROVADO: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Aprovado' },
  EM_EXECUCAO: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-700',
    label: 'Em execução'
  },
  CONCLUIDO: { bg: 'bg-green-100', text: 'text-green-700', label: 'Concluído' },
  CANCELADO: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Cancelado' }
};
