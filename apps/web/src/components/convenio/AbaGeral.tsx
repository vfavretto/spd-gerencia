import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit2, Save, X, CalendarCheck, FileSignature } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Convenio } from '../../types';
import { convenioService } from '../../services/convenioService';
import { configService } from '../../services/configService';
import { formatDate } from '../../utils/format';
import { RegistrarAssinaturaModal } from './modals/RegistrarAssinaturaModal';
import { AditivarModal } from './modals/AditivarModal';

type Props = {
  convenio: Convenio;
  onUpdate: () => void;
};

export function AbaGeral({ convenio, onUpdate }: Props) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showAssinaturaModal, setShowAssinaturaModal] = useState(false);
  const [showAditivoModal, setShowAditivoModal] = useState(false);

  const { data: catalogs } = useQuery({
    queryKey: ['catalogs'],
    queryFn: () => configService.getCatalogs()
  });

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      codigo: convenio.codigo,
      titulo: convenio.titulo,
      objeto: convenio.objeto,
      descricao: convenio.descricao || '',
      numeroProposta: convenio.numeroProposta || '',
      numeroTermo: convenio.numeroTermo || '',
      dataAssinatura: convenio.dataAssinatura
        ? new Date(convenio.dataAssinatura).toISOString().split('T')[0]
        : '',
      dataInicioVigencia: convenio.dataInicioVigencia
        ? new Date(convenio.dataInicioVigencia).toISOString().split('T')[0]
        : '',
      dataFimVigencia: convenio.dataFimVigencia
        ? new Date(convenio.dataFimVigencia).toISOString().split('T')[0]
        : '',
      esfera: convenio.esfera || '',
      modalidadeRepasse: convenio.modalidadeRepasse || '',
      secretariaId: convenio.secretaria?.id,
      orgaoId: convenio.orgao?.id,
      programaId: convenio.programa?.id
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => convenioService.update(convenio.id, {
      ...data,
      dataAssinatura: data.dataAssinatura || null,
      dataInicioVigencia: data.dataInicioVigencia || null,
      dataFimVigencia: data.dataFimVigencia || null,
      orgaoId: data.orgaoId || null,
      programaId: data.programaId || null
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convenio', String(convenio.id)] });
      setIsEditing(false);
      onUpdate();
    }
  });

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const onSubmit = (data: any) => {
    updateMutation.mutate(data);
  };

  const esferaLabel = {
    FEDERAL: 'Federal',
    ESTADUAL: 'Estadual'
  };

  const modalidadeLabel = {
    CONVENIO: 'Convênio',
    CONTRATO_REPASSE: 'Contrato de Repasse',
    TERMO_FOMENTO: 'Termo de Fomento',
    TERMO_COLABORACAO: 'Termo de Colaboração'
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Dados Gerais</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <X className="h-4 w-4" />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-500 disabled:opacity-70"
            >
              <Save className="h-4 w-4" />
              {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="form-label">Código</label>
            <input className="form-input" {...register('codigo')} />
          </div>
          <div>
            <label className="form-label">Nº do Termo</label>
            <input className="form-input" {...register('numeroTermo')} />
          </div>
        </div>

        <div>
          <label className="form-label">Título</label>
          <input className="form-input" {...register('titulo')} />
        </div>

        <div>
          <label className="form-label">Objeto</label>
          <textarea className="form-input" rows={3} {...register('objeto')} />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="form-label">Data Assinatura</label>
            <input type="date" className="form-input" {...register('dataAssinatura')} />
          </div>
          <div>
            <label className="form-label">Início Vigência</label>
            <input type="date" className="form-input" {...register('dataInicioVigencia')} />
          </div>
          <div>
            <label className="form-label">Fim Vigência</label>
            <input type="date" className="form-input" {...register('dataFimVigencia')} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="form-label">Esfera</label>
            <select className="form-input" {...register('esfera')}>
              <option value="">Selecione</option>
              <option value="FEDERAL">Federal</option>
              <option value="ESTADUAL">Estadual</option>
            </select>
          </div>
          <div>
            <label className="form-label">Modalidade</label>
            <select className="form-input" {...register('modalidadeRepasse')}>
              <option value="">Selecione</option>
              <option value="CONVENIO">Convênio</option>
              <option value="CONTRATO_REPASSE">Contrato de Repasse</option>
              <option value="TERMO_FOMENTO">Termo de Fomento</option>
              <option value="TERMO_COLABORACAO">Termo de Colaboração</option>
            </select>
          </div>
          <div>
            <label className="form-label">Órgão Concedente</label>
            <select
              className="form-input"
              {...register('orgaoId', {
                setValueAs: (v) => (v === '' ? undefined : Number(v))
              })}
            >
              <option value="">Selecione</option>
              {catalogs?.orgaos.map((o) => (
                <option key={o.id} value={o.id}>{o.nome}</option>
              ))}
            </select>
          </div>
        </div>
      </form>
    );
  }

  const podeRegistrarAssinatura = !convenio.dataAssinatura && convenio.status === 'RASCUNHO';
  const numeroAditivos = convenio.aditivos?.length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Dados Gerais</h3>
        <div className="flex gap-2">
          {podeRegistrarAssinatura && (
            <button
              onClick={() => setShowAssinaturaModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
            >
              <CalendarCheck className="h-4 w-4" />
              Registrar Assinatura
            </button>
          )}
          {convenio.dataAssinatura && (
            <button
              onClick={() => setShowAditivoModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-100 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-200"
            >
              <FileSignature className="h-4 w-4" />
              Aditivar
            </button>
          )}
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            <Edit2 className="h-4 w-4" />
            Editar
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Identificação */}
        <div className="space-y-4">
          <h4 className="font-medium text-slate-700 border-b border-slate-100 pb-2">
            Identificação
          </h4>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Código:</dt>
              <dd className="font-medium text-slate-900">{convenio.codigo}</dd>
            </div>
            {convenio.numeroTermo && (
              <div className="flex justify-between">
                <dt className="text-slate-500">Nº do Termo:</dt>
                <dd className="font-medium text-slate-900">{convenio.numeroTermo}</dd>
              </div>
            )}
            {convenio.numeroProposta && (
              <div className="flex justify-between">
                <dt className="text-slate-500">Nº da Proposta:</dt>
                <dd className="font-medium text-slate-900">{convenio.numeroProposta}</dd>
              </div>
            )}
            {convenio.esfera && (
              <div className="flex justify-between">
                <dt className="text-slate-500">Esfera:</dt>
                <dd className="font-medium text-slate-900">
                  {esferaLabel[convenio.esfera as keyof typeof esferaLabel]}
                </dd>
              </div>
            )}
            {convenio.modalidadeRepasse && (
              <div className="flex justify-between">
                <dt className="text-slate-500">Modalidade:</dt>
                <dd className="font-medium text-slate-900">
                  {modalidadeLabel[convenio.modalidadeRepasse as keyof typeof modalidadeLabel]}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Vigência */}
        <div className="space-y-4">
          <h4 className="font-medium text-slate-700 border-b border-slate-100 pb-2">
            Vigência
          </h4>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Assinatura:</dt>
              <dd className="font-medium text-slate-900">
                {formatDate(convenio.dataAssinatura) || '—'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Início:</dt>
              <dd className="font-medium text-slate-900">
                {formatDate(convenio.dataInicioVigencia) || '—'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Fim:</dt>
              <dd className="font-medium text-slate-900">
                {formatDate(convenio.dataFimVigencia) || '—'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Objeto */}
      <div className="space-y-2">
        <h4 className="font-medium text-slate-700">Objeto</h4>
        <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-4">
          {convenio.objeto}
        </p>
      </div>

      {/* Classificação */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500 mb-1">Secretaria</p>
          <p className="font-medium text-slate-900">
            {convenio.secretaria?.nome || '—'}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500 mb-1">Órgão Concedente</p>
          <p className="font-medium text-slate-900">
            {convenio.orgao?.nome || '—'}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500 mb-1">Programa</p>
          <p className="font-medium text-slate-900">
            {convenio.programa?.nome || '—'}
          </p>
        </div>
      </div>

      {/* Emendas Parlamentares */}
      {convenio.emendas && convenio.emendas.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-slate-700">Emendas Parlamentares</h4>
          <div className="space-y-2">
            {convenio.emendas.map((emenda) => (
              <div
                key={emenda.id}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {emenda.nomeParlamentar}
                  </p>
                  <p className="text-xs text-slate-500">
                    {emenda.partido} {emenda.codigoEmenda && `• ${emenda.codigoEmenda}`}
                  </p>
                </div>
                {emenda.valorIndicado && (
                  <span className="text-sm font-semibold text-emerald-600">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(Number(emenda.valorIndicado))}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aditivos */}
      {convenio.aditivos && convenio.aditivos.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-slate-700">Histórico de Aditivos</h4>
          <div className="space-y-2">
            {convenio.aditivos.map((aditivo) => (
              <div
                key={aditivo.id}
                className="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {aditivo.numeroAditivo}º Aditivo - {aditivo.tipoAditivo.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-slate-500">
                    {aditivo.dataAssinatura && formatDate(aditivo.dataAssinatura)}
                    {aditivo.motivo && ` • ${aditivo.motivo}`}
                  </p>
                </div>
                {aditivo.novaVigencia && (
                  <span className="text-sm font-medium text-amber-700">
                    Nova vigência: {formatDate(aditivo.novaVigencia)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modais */}
      <RegistrarAssinaturaModal
        isOpen={showAssinaturaModal}
        onClose={() => setShowAssinaturaModal(false)}
        convenioId={convenio.id}
        onSuccess={onUpdate}
      />

      <AditivarModal
        isOpen={showAditivoModal}
        onClose={() => setShowAditivoModal(false)}
        convenioId={convenio.id}
        vigenciaAtual={convenio.dataFimVigencia}
        numeroAditivos={numeroAditivos}
        onSuccess={onUpdate}
      />
    </div>
  );
}

