import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  Send
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Convenio, StatusPendencia } from '../../types';
import { pendenciaService } from '../../services/pendenciaService';
import { formatDate } from '../../utils/format';
import { Badge } from '../ui/Badge';
import { Modal, ModalButton } from '../ui/Modal';

type Props = {
  convenio: Convenio;
  onUpdate: () => void;
};

const statusConfig: Record<StatusPendencia, { label: string; variant: 'danger' | 'warning' | 'success' | 'neutral'; icon: typeof AlertTriangle }> = {
  ABERTA: { label: 'Aberta', variant: 'danger', icon: AlertTriangle },
  EM_ANDAMENTO: { label: 'Em Andamento', variant: 'warning', icon: Clock },
  RESOLVIDA: { label: 'Resolvida', variant: 'success', icon: CheckCircle },
  CANCELADA: { label: 'Cancelada', variant: 'neutral', icon: CheckCircle }
};

const prioridadeLabel: Record<number, { label: string; color: string }> = {
  1: { label: 'Alta', color: 'text-rose-600 bg-rose-100' },
  2: { label: 'Média', color: 'text-amber-600 bg-amber-100' },
  3: { label: 'Baixa', color: 'text-slate-600 bg-slate-100' }
};

export function AbaDiario({ convenio, onUpdate }: Props) {
  const queryClient = useQueryClient();
  const [showNovaPendencia, setShowNovaPendencia] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const pendencias = convenio.pendencias || [];

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      descricao: '',
      responsavel: '',
      prazo: '',
      prioridade: 2,
      status: 'ABERTA' as StatusPendencia
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => pendenciaService.create(convenio.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convenio', String(convenio.id)] });
      setShowNovaPendencia(false);
      reset();
      onUpdate();
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: StatusPendencia }) =>
      pendenciaService.update(convenio.id, id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convenio', String(convenio.id)] });
      onUpdate();
    }
  });

  const onSubmit = (data: any) => {
    createMutation.mutate({
      ...data,
      prazo: data.prazo || null,
      prioridade: Number(data.prioridade)
    });
  };

  const pendenciasFiltradas = filtroStatus
    ? pendencias.filter((p) => p.status === filtroStatus)
    : pendencias;

  const countByStatus = {
    ABERTA: pendencias.filter((p) => p.status === 'ABERTA').length,
    EM_ANDAMENTO: pendencias.filter((p) => p.status === 'EM_ANDAMENTO').length,
    RESOLVIDA: pendencias.filter((p) => p.status === 'RESOLVIDA').length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">
          Diário de Pendências
        </h3>
        <button
          onClick={() => setShowNovaPendencia(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-500"
        >
          <Plus className="h-4 w-4" />
          Nova Pendência
        </button>
      </div>

      {/* Filtros por Status */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFiltroStatus('')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            filtroStatus === ''
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Todas ({pendencias.length})
        </button>
        <button
          onClick={() => setFiltroStatus('ABERTA')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            filtroStatus === 'ABERTA'
              ? 'bg-rose-600 text-white'
              : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
          }`}
        >
          Abertas ({countByStatus.ABERTA})
        </button>
        <button
          onClick={() => setFiltroStatus('EM_ANDAMENTO')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            filtroStatus === 'EM_ANDAMENTO'
              ? 'bg-amber-600 text-white'
              : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
          }`}
        >
          Em Andamento ({countByStatus.EM_ANDAMENTO})
        </button>
        <button
          onClick={() => setFiltroStatus('RESOLVIDA')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            filtroStatus === 'RESOLVIDA'
              ? 'bg-emerald-600 text-white'
              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
          }`}
        >
          Resolvidas ({countByStatus.RESOLVIDA})
        </button>
      </div>

      {/* Lista de Pendências */}
      {pendenciasFiltradas.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-slate-300" />
          <h4 className="mt-4 font-medium text-slate-700">
            {filtroStatus ? 'Nenhuma pendência com este status' : 'Nenhuma pendência registrada'}
          </h4>
          <p className="mt-1 text-sm text-slate-500">
            Registre pendências para acompanhar problemas e ações necessárias
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendenciasFiltradas.map((pendencia) => {
            const config = statusConfig[pendencia.status];
            const prioridade = prioridadeLabel[pendencia.prioridade || 2];
            const StatusIcon = config.icon;

            return (
              <div
                key={pendencia.id}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start gap-3">
                  {/* Ícone de Status */}
                  <div
                    className={`rounded-full p-2 ${
                      config.variant === 'danger'
                        ? 'bg-rose-100 text-rose-600'
                        : config.variant === 'warning'
                          ? 'bg-amber-100 text-amber-600'
                          : config.variant === 'success'
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <StatusIcon className="h-4 w-4" />
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-slate-900">
                        {pendencia.descricao}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${prioridade.color}`}
                        >
                          {prioridade.label}
                        </span>
                        <Badge variant={config.variant} size="sm">
                          {config.label}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      {pendencia.responsavel && (
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {pendencia.responsavel}
                        </span>
                      )}
                      {pendencia.prazo && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Prazo: {formatDate(pendencia.prazo)}
                        </span>
                      )}
                      {pendencia.criadoPor && (
                        <span>
                          Por: {pendencia.criadoPor.nome}
                        </span>
                      )}
                    </div>

                    {pendencia.resolucao && (
                      <div className="mt-2 rounded-lg bg-emerald-50 p-2 text-sm text-emerald-700">
                        <strong>Resolução:</strong> {pendencia.resolucao}
                      </div>
                    )}

                    {/* Ações de Status */}
                    {pendencia.status !== 'RESOLVIDA' && pendencia.status !== 'CANCELADA' && (
                      <div className="mt-3 flex gap-2">
                        {pendencia.status === 'ABERTA' && (
                          <button
                            onClick={() =>
                              updateStatusMutation.mutate({
                                id: pendencia.id,
                                status: 'EM_ANDAMENTO'
                              })
                            }
                            className="rounded-lg bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-200"
                          >
                            Iniciar
                          </button>
                        )}
                        <button
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: pendencia.id,
                              status: 'RESOLVIDA'
                            })
                          }
                          className="rounded-lg bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-200"
                        >
                          Resolver
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Nova Pendência */}
      <Modal
        isOpen={showNovaPendencia}
        onClose={() => setShowNovaPendencia(false)}
        title="Nova Pendência"
        description="Registre um problema ou ação necessária"
        footer={
          <>
            <ModalButton variant="secondary" onClick={() => setShowNovaPendencia(false)}>
              Cancelar
            </ModalButton>
            <ModalButton
              variant="primary"
              onClick={handleSubmit(onSubmit)}
              loading={createMutation.isPending}
            >
              <Send className="h-4 w-4" />
              Registrar
            </ModalButton>
          </>
        }
      >
        <form className="space-y-4">
          <div>
            <label className="form-label">Descrição *</label>
            <textarea
              className="form-input"
              rows={3}
              {...register('descricao')}
              placeholder="Descreva a pendência ou problema..."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="form-label">Responsável</label>
              <input
                className="form-input"
                {...register('responsavel')}
                placeholder="Quem deve resolver?"
              />
            </div>
            <div>
              <label className="form-label">Prazo</label>
              <input type="date" className="form-input" {...register('prazo')} />
            </div>
          </div>

          <div>
            <label className="form-label">Prioridade</label>
            <select className="form-input" {...register('prioridade')}>
              <option value={1}>Alta</option>
              <option value={2}>Média</option>
              <option value={3}>Baixa</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}

