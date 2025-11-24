import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PlusCircle } from 'lucide-react';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
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

export const ConveniosCadastroPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: catalogs } = useQuery({
    queryKey: ['catalogs'],
    queryFn: () => configService.getCatalogs()
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
      navigate('/convenios');
    }
  });

  const onSubmit = (data: ConvenioForm) => {
    createMutation.mutate(data);
  };

  const secretariaOptions = useMemo(
    () => catalogs?.secretarias ?? [],
    [catalogs?.secretarias]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cadastrar convênio"
        subtitle="Preencha os dados conforme o modelo utilizado internamente."
      />

      <section className="glass-panel">
        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
          <PlusCircle className="h-5 w-5 text-primary-500" />
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Dados do convênio
            </h3>
            <p className="text-sm text-slate-500">
              Todos os campos marcados são obrigatórios.
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
    </div>
  );
};

