import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Filter, PlusCircle, RefreshCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { convenioStatusOptions } from '../constants';
import {
  convenioService,
  type ConvenioFilters
} from '../services/convenioService';
import { configService } from '../services/configService';
import { formatCurrency, formatDate } from '../utils/format';

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

export const ConveniosPage = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ConvenioFilters>({});

  const { data: catalogs } = useQuery({
    queryKey: ['catalogs'],
    queryFn: () => configService.getCatalogs()
  });

  const conveniosQuery = useQuery({
    queryKey: ['convenios', filters],
    queryFn: () => convenioService.list(filters)
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ConvenioForm>({
    resolver: zodResolver(convenioSchema),
    defaultValues: {
      status: 'RASCUNHO',
      valorGlobal: undefined
    } as Partial<ConvenioForm>
  });

  const createMutation = useMutation({
    mutationFn: (payload: ConvenioForm) =>
      convenioService.create({
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
      reset();
    }
  });

  const onSubmit = (data: ConvenioForm) => {
    createMutation.mutate(data);
  };

  const convenios = conveniosQuery.data ?? [];

  const secretariaOptions = useMemo(
    () => catalogs?.secretarias ?? [],
    [catalogs?.secretarias]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestão de convênios"
        subtitle="Cadastre novos convênios e acompanhe os existentes em tempo real."
        actions={
          <button
            onClick={() => conveniosQuery.refetch()}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:text-primary-600"
          >
            <RefreshCcw className="h-4 w-4" />
            Atualizar lista
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="glass-panel">
          <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
            <PlusCircle className="h-5 w-5 text-primary-500" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Registrar convênio
              </h3>
              <p className="text-sm text-slate-500">
                Informe os dados conforme o modelo utilizado internamente.
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
            </div>

            <div>
              <label className="form-label">Objeto</label>
              <textarea
                rows={2}
                className="form-input"
                {...register('objeto')}
                placeholder="Descreva o objetivo principal"
              />
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

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || createMutation.isPending}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-500 disabled:opacity-70"
              >
                {createMutation.isPending ? 'Salvando...' : 'Salvar convênio'}
              </button>
            </div>
            {createMutation.isSuccess && (
              <p className="text-sm text-emerald-600">
                Convênio salvo com sucesso!
              </p>
            )}
          </form>
        </section>

        <section className="glass-panel space-y-4 p-6">
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Convênios cadastrados
              </h3>
              <p className="text-sm text-slate-500">
                Utilize os filtros abaixo para refinar a busca.
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="col-span-1 md:col-span-1">
              <label className="form-label flex items-center gap-2">
                <Filter className="h-4 w-4" /> Buscar
              </label>
              <input
                className="form-input"
                placeholder="Título ou código"
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, search: event.target.value }))
                }
              />
            </div>
            <div>
              <label className="form-label">Status</label>
              <select
                className="form-input"
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: (event.target.value as ConvenioFilters['status']) || ''
                  }))
                }
              >
                <option value="">Todos</option>
                {convenioStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Secretaria</label>
              <select
                className="form-input"
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    secretariaId:
                      event.target.value === ''
                        ? ''
                        : Number(event.target.value)
                  }))
                }
              >
                <option value="">Todas</option>
                {secretariaOptions.map((secretaria) => (
                  <option key={secretaria.id} value={secretaria.id}>
                    {secretaria.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative overflow-x-auto rounded-3xl border border-slate-100">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Convênio</th>
                  <th className="px-4 py-3">Secretaria</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3">Vigência</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 bg-white/70">
                {convenios.map((convenio) => (
                  <tr key={convenio.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">
                        {convenio.titulo}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        {convenio.codigo}
                        <StatusBadge status={convenio.status} />
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {convenio.secretaria?.nome ?? '—'}
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-900">
                      {formatCurrency(convenio.valorGlobal)}
                    </td>
                    <td className="px-4 py-4 text-slate-500">
                      {formatDate(convenio.dataInicioVigencia)} <br />{' '}
                      <span className="text-xs text-slate-400">
                        até {formatDate(convenio.dataFimVigencia)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {convenios.length === 0 && (
              <p className="p-6 text-center text-sm text-slate-400">
                Nenhum convênio encontrado com os filtros atuais.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
