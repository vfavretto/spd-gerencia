import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Loader2 } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { PageHeader } from '../components/PageHeader';
import { convenioStatusOptions } from '../constants';
import { convenioService } from '../services/convenioService';
import { configService } from '../services/configService';

const convenioSchema = z.object({
  codigo: z.string().min(3, 'Informe o código do convênio'),
  titulo: z.string().min(3, 'Título obrigatório'),
  objeto: z.string().min(3, 'Descreva o objeto'),
  descricao: z.string().optional(),
  observacoes: z.string().optional(),
  valorGlobal: z.number(),
  valorRepasse: z.number().optional(),
  valorContrapartida: z.number().optional(),
  dataAssinatura: z.string().optional(),
  dataInicioVigencia: z.string().optional(),
  dataFimVigencia: z.string().optional(),
  status: z.enum(
    [
      'RASCUNHO',
      'EM_ANALISE',
      'APROVADO',
      'EM_EXECUCAO',
      'CONCLUIDO',
      'CANCELADO'
    ] as const
  ),
  secretariaId: z.number(),
  orgaoId: z.number().optional(),
  programaId: z.number().optional(),
  fonteId: z.number().optional()
});

type ConvenioForm = z.infer<typeof convenioSchema>;

export const ConveniosEdicaoPage = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: catalogs } = useQuery({
    queryKey: ['catalogs'],
    queryFn: () => configService.getCatalogs()
  });

  const { data: convenio, isLoading } = useQuery({
    queryKey: ['convenio', id],
    queryFn: () => convenioService.getById(Number(id)),
    enabled: !!id
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ConvenioForm>({
    resolver: zodResolver(convenioSchema)
  });

  // Preencher formulário quando os dados do convênio forem carregados
  useEffect(() => {
    if (convenio) {
      reset({
        codigo: convenio.codigo,
        titulo: convenio.titulo,
        objeto: convenio.objeto,
        descricao: convenio.descricao || '',
        observacoes: convenio.observacoes || '',
        valorGlobal: Number(convenio.valorGlobal),
        valorRepasse: convenio.valorRepasse ? Number(convenio.valorRepasse) : undefined,
        valorContrapartida: convenio.valorContrapartida
          ? Number(convenio.valorContrapartida)
          : undefined,
        dataAssinatura: convenio.dataAssinatura
          ? new Date(convenio.dataAssinatura).toISOString().split('T')[0]
          : '',
        dataInicioVigencia: convenio.dataInicioVigencia
          ? new Date(convenio.dataInicioVigencia).toISOString().split('T')[0]
          : '',
        dataFimVigencia: convenio.dataFimVigencia
          ? new Date(convenio.dataFimVigencia).toISOString().split('T')[0]
          : '',
        status: convenio.status,
        secretariaId: convenio.secretaria?.id,
        orgaoId: convenio.orgao?.id,
        programaId: convenio.programa?.id,
        fonteId: convenio.fonte?.id
      });
    }
  }, [convenio, reset]);

  const updateMutation = useMutation({
    mutationFn: (payload: ConvenioForm) =>
      convenioService.update(Number(id), {
        ...payload,
        dataAssinatura: payload.dataAssinatura || null,
        dataInicioVigencia: payload.dataInicioVigencia || null,
        dataFimVigencia: payload.dataFimVigencia || null,
        orgaoId: payload.orgaoId || null,
        programaId: payload.programaId || null,
        fonteId: payload.fonteId || null,
        valorRepasse: payload.valorRepasse ?? null,
        valorContrapartida: payload.valorContrapartida ?? null
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convenios'] });
      queryClient.invalidateQueries({ queryKey: ['convenio', id] });
      navigate('/convenios');
    }
  });

  const onSubmit = (data: ConvenioForm) => {
    updateMutation.mutate(data);
  };

  const secretariaOptions = useMemo(
    () => catalogs?.secretarias ?? [],
    [catalogs?.secretarias]
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 text-primary-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-lg font-semibold">Carregando convênio...</p>
        </div>
      </div>
    );
  }

  if (!convenio) {
    return (
      <div className="space-y-6">
        <PageHeader title="Convênio não encontrado" subtitle="" />
        <div className="glass-panel p-6 text-center">
          <p className="text-slate-600">O convênio solicitado não foi encontrado.</p>
          <button
            onClick={() => navigate('/convenios')}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-500"
          >
            Voltar para lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar convênio"
        subtitle={`Atualize as informações do convênio ${convenio.codigo}`}
      />

      <section className="glass-panel">
        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
          <Edit className="h-5 w-5 text-primary-500" />
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Dados do convênio
            </h3>
            <p className="text-sm text-slate-500">
              Modifique os campos necessários e salve as alterações.
            </p>
          </div>
        </div>
        <form className="grid gap-4 p-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="form-label">Código</label>
              <input
                className="form-input"
                {...register('codigo')}
                placeholder="Ex: CONV-001/2025"
              />
              {errors.codigo && (
                <p className="text-xs text-rose-500">{errors.codigo.message}</p>
              )}
            </div>
            <div>
              <label className="form-label">Status</label>
              <select className="form-input" {...register('status')}>
                {convenioStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Título</label>
            <input
              className="form-input"
              {...register('titulo')}
              placeholder="Título oficial do convênio"
            />
            {errors.titulo && (
              <p className="text-xs text-rose-500">{errors.titulo.message}</p>
            )}
          </div>

          <div>
            <label className="form-label">Objeto</label>
            <textarea
              rows={2}
              className="form-input"
              {...register('objeto')}
              placeholder="Descreva o objetivo principal"
            />
            {errors.objeto && (
              <p className="text-xs text-rose-500">{errors.objeto.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="form-label">Valor global</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                {...register('valorGlobal', {
                  setValueAs: (value) =>
                    value === '' ? undefined : Number.parseFloat(value)
                })}
              />
              {errors.valorGlobal && (
                <p className="text-xs text-rose-500">
                  {errors.valorGlobal.message}
                </p>
              )}
            </div>
            <div>
              <label className="form-label">Repasse</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                {...register('valorRepasse', {
                  setValueAs: (value) =>
                    value === '' ? undefined : Number.parseFloat(value)
                })}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="form-label">Contrapartida</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                {...register('valorContrapartida', {
                  setValueAs: (value) =>
                    value === '' ? undefined : Number.parseFloat(value)
                })}
              />
            </div>
            <div>
              <label className="form-label">Secretaria responsável</label>
              <select
                className="form-input"
                {...register('secretariaId', {
                  setValueAs: (value) =>
                    value === '' ? undefined : Number.parseInt(value, 10)
                })}
              >
                <option value="">Selecione</option>
                {secretariaOptions.map((secretaria) => (
                  <option key={secretaria.id} value={secretaria.id}>
                    {secretaria.nome}
                  </option>
                ))}
              </select>
              {errors.secretariaId && (
                <p className="text-xs text-rose-500">
                  {errors.secretariaId.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="form-label">Data de assinatura</label>
              <input type="date" className="form-input" {...register('dataAssinatura')} />
            </div>
            <div>
              <label className="form-label">Início vigência</label>
              <input
                type="date"
                className="form-input"
                {...register('dataInicioVigencia')}
              />
            </div>
            <div>
              <label className="form-label">Fim vigência</label>
              <input
                type="date"
                className="form-input"
                {...register('dataFimVigencia')}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="form-label">Órgão concedente</label>
              <select
                className="form-input"
                {...register('orgaoId', {
                  setValueAs: (value) =>
                    value === '' ? undefined : Number.parseInt(value, 10)
                })}
              >
                <option value="">Selecione</option>
                {catalogs?.orgaos.map((orgao) => (
                  <option key={orgao.id} value={orgao.id}>
                    {orgao.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Programa</label>
              <select
                className="form-input"
                {...register('programaId', {
                  setValueAs: (value) =>
                    value === '' ? undefined : Number.parseInt(value, 10)
                })}
              >
                <option value="">Selecione</option>
                {catalogs?.programas.map((programa) => (
                  <option key={programa.id} value={programa.id}>
                    {programa.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Fonte de recurso</label>
              <select
                className="form-input"
                {...register('fonteId', {
                  setValueAs: (value) =>
                    value === '' ? undefined : Number.parseInt(value, 10)
                })}
              >
                <option value="">Selecione</option>
                {catalogs?.fontes.map((fonte) => (
                  <option key={fonte.id} value={fonte.id}>
                    {fonte.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/convenios')}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || updateMutation.isPending}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-500 disabled:opacity-70"
            >
              {updateMutation.isPending ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
          {updateMutation.isSuccess && (
            <p className="text-sm text-emerald-600">
              Convênio atualizado com sucesso!
            </p>
          )}
        </form>
      </section>
    </div>
  );
};

