import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileText, DollarSign, FolderKanban } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { PageHeader } from '@/components/PageHeader';
import { WizardStepper, WizardNavigation, type WizardStep } from '@/components/wizard';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toaster';
import { convenioService } from '@/services/convenioService';
import { configService } from '@/services/configService';

// Schema de validação para o Wizard
const wizardSchema = z.object({
  // Step 1: Identificação
  codigo: z.string().min(3, 'Informe o código do convênio'),
  titulo: z.string().min(3, 'Título obrigatório'),
  objeto: z.string().min(3, 'Descreva o objeto'),
  secretariaId: z.number({ required_error: 'Selecione a secretaria' }),

  // Step 2: Valores Macro
  valorGlobal: z.number({ required_error: 'Informe o valor global' }).min(0),
  valorRepasse: z.number().min(0).optional(),
  valorContrapartida: z.number().min(0).optional(),
  esfera: z.enum(['FEDERAL', 'ESTADUAL']).optional(),

  // Step 3: Classificação
  orgaoId: z.number().optional(),
  programaId: z.number().optional(),
  fonteId: z.number().optional(),
  modalidadeRepasse: z.enum([
    'CONVENIO',
    'CONTRATO_REPASSE',
    'TERMO_FOMENTO',
    'TERMO_COLABORACAO'
  ]).optional()
});

type WizardFormData = z.infer<typeof wizardSchema>;

const wizardSteps: WizardStep[] = [
  {
    id: 'identificacao',
    title: 'Identificação',
    description: 'Dados básicos'
  },
  {
    id: 'valores',
    title: 'Valores',
    description: 'Financeiro'
  },
  {
    id: 'classificacao',
    title: 'Classificação',
    description: 'Categorização'
  }
];

const esferaOptions = [
  { value: 'FEDERAL', label: 'Federal' },
  { value: 'ESTADUAL', label: 'Estadual' }
];

const modalidadeOptions = [
  { value: 'CONVENIO', label: 'Convênio' },
  { value: 'CONTRATO_REPASSE', label: 'Contrato de Repasse' },
  { value: 'TERMO_FOMENTO', label: 'Termo de Fomento' },
  { value: 'TERMO_COLABORACAO', label: 'Termo de Colaboração' }
];

export const ConveniosCadastroPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [_currencyTrigger, setCurrencyTrigger] = useState(0);

  const { data: catalogs } = useQuery({
    queryKey: ['catalogs'],
    queryFn: () => configService.getCatalogs()
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors }
  } = useForm<WizardFormData>({
    resolver: zodResolver(wizardSchema)
  });

  const watchedFields = watch();

  const createMutation = useMutation({
    mutationFn: (payload: WizardFormData) =>
      convenioService.create({
        ...payload,
        status: 'RASCUNHO',
        dataAssinatura: null,
        dataInicioVigencia: null,
        dataFimVigencia: null,
        orgaoId: payload.orgaoId || null,
        programaId: payload.programaId || null,
        fonteId: payload.fonteId || null,
        valorRepasse: payload.valorRepasse ?? null,
        valorContrapartida: payload.valorContrapartida ?? null
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convenios'] });
      toast.success('Convênio criado com sucesso!');
      navigate('/convenios');
    },
    onError: () => {
      toast.error('Erro ao criar convênio');
    }
  });

  const secretariaOptions = useMemo(
    () => catalogs?.secretarias ?? [],
    [catalogs?.secretarias]
  );

  // Validação por step
  const validateStep = async (step: number): Promise<boolean> => {
    switch (step) {
      case 0:
        return trigger(['codigo', 'titulo', 'objeto', 'secretariaId']);
      case 1:
        return trigger(['valorGlobal']);
      case 2:
        return true;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < wizardSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleStepClick = async (stepIndex: number) => {
    if (stepIndex < currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  const onSubmit = (data: WizardFormData) => {
    createMutation.mutate(data);
  };

  const handleCurrencyChange = (field: 'valorGlobal' | 'valorRepasse' | 'valorContrapartida') => {
    return (value: number | null) => {
      setValue(field, value ?? 0);
      setCurrencyTrigger(prev => prev + 1);
    };
  };

  // Determinar se pode prosseguir baseado no step atual
  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 0:
        return Boolean(
          watchedFields.codigo &&
          watchedFields.titulo &&
          watchedFields.objeto &&
          watchedFields.secretariaId
        );
      case 1:
        return watchedFields.valorGlobal !== undefined && watchedFields.valorGlobal > 0;
      case 2:
        return true;
      default:
        return true;
    }
  }, [currentStep, watchedFields]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo Convênio"
        subtitle="Cadastre um novo convênio em 3 passos simples."
      />

      <section className="glass-panel">
        {/* Wizard Stepper */}
        <div className="border-b border-slate-100 px-6 py-6">
          <WizardStepper
            steps={wizardSteps}
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-6 py-6">
            {/* Step 1: Identificação */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4">
                  <span className="rounded-2xl bg-primary-100 p-2.5 text-primary-600">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Identificação do Convênio
                    </h3>
                    <p className="text-sm text-slate-500">
                      Informe os dados básicos para identificar o convênio
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="form-label">Código *</label>
                    <input
                      className="form-input"
                      {...register('codigo')}
                      placeholder="Ex: CONV-001/2025"
                    />
                    {errors.codigo && (
                      <p className="mt-1 text-xs text-rose-500">{errors.codigo.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="form-label">Secretaria Responsável *</label>
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
                      <p className="mt-1 text-xs text-rose-500">{errors.secretariaId.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="form-label">Título *</label>
                  <input
                    className="form-input"
                    {...register('titulo')}
                    placeholder="Título oficial do convênio"
                  />
                  {errors.titulo && (
                    <p className="mt-1 text-xs text-rose-500">{errors.titulo.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">Objeto *</label>
                  <textarea
                    rows={3}
                    className="form-input"
                    {...register('objeto')}
                    placeholder="Descreva o objetivo principal do convênio"
                  />
                  {errors.objeto && (
                    <p className="mt-1 text-xs text-rose-500">{errors.objeto.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Valores */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4">
                  <span className="rounded-2xl bg-emerald-100 p-2.5 text-emerald-600">
                    <DollarSign className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Valores Financeiros
                    </h3>
                    <p className="text-sm text-slate-500">
                      Defina os valores macro do convênio
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Valor Global *</Label>
                    <CurrencyInput
                      placeholder="R$ 0,00"
                      value={watchedFields.valorGlobal}
                      onValueChange={handleCurrencyChange('valorGlobal')}
                    />
                    {errors.valorGlobal && (
                      <p className="text-xs text-destructive">{errors.valorGlobal.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Esfera</Label>
                    <select
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                      {...register('esfera')}
                    >
                      <option value="">Selecione</option>
                      {esferaOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Valor do Repasse</Label>
                    <CurrencyInput
                      placeholder="R$ 0,00"
                      value={watchedFields.valorRepasse}
                      onValueChange={handleCurrencyChange('valorRepasse')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valor da Contrapartida</Label>
                    <CurrencyInput
                      placeholder="R$ 0,00"
                      value={watchedFields.valorContrapartida}
                      onValueChange={handleCurrencyChange('valorContrapartida')}
                    />
                  </div>
                </div>

                {/* Resumo dos valores */}
                {watchedFields.valorGlobal && watchedFields.valorGlobal > 0 && (
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3">
                      Resumo Financeiro
                    </h4>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Valor Global:</span>
                        <span className="font-semibold text-slate-900">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(watchedFields.valorGlobal || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Repasse:</span>
                        <span className="font-medium text-emerald-600">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(watchedFields.valorRepasse || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Contrapartida:</span>
                        <span className="font-medium text-primary-600">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(watchedFields.valorContrapartida || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Classificação */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4">
                  <span className="rounded-2xl bg-amber-100 p-2.5 text-amber-600">
                    <FolderKanban className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Classificação
                    </h3>
                    <p className="text-sm text-slate-500">
                      Categorize o convênio (opcional - pode ser preenchido depois)
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="form-label">Órgão Concedente</label>
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
                    <label className="form-label">Modalidade de Repasse</label>
                    <select
                      className="form-input"
                      {...register('modalidadeRepasse')}
                    >
                      <option value="">Selecione</option>
                      {modalidadeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
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
                    <label className="form-label">Fonte de Recurso</label>
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

                {/* Resumo do cadastro */}
                <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-100">
                  <h4 className="text-sm font-semibold text-emerald-700 mb-3">
                    Resumo do Convênio
                  </h4>
                  <dl className="grid gap-2 text-sm">
                    <div className="flex gap-2">
                      <dt className="text-slate-500">Código:</dt>
                      <dd className="font-medium text-slate-900">{watchedFields.codigo || '—'}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-slate-500">Título:</dt>
                      <dd className="font-medium text-slate-900">{watchedFields.titulo || '—'}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-slate-500">Valor Global:</dt>
                      <dd className="font-medium text-emerald-600">
                        {watchedFields.valorGlobal
                          ? new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(watchedFields.valorGlobal)
                          : '—'}
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-xs text-emerald-600">
                    O convênio será criado como <strong>Rascunho</strong>. 
                    Você poderá completar os dados na tela de detalhes.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navegação do Wizard */}
          <div className="px-6 pb-6">
            <WizardNavigation
              currentStep={currentStep}
              totalSteps={wizardSteps.length}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onSubmit={handleSubmit(onSubmit)}
              isSubmitting={createMutation.isPending}
              canProceed={canProceed}
            />
          </div>

          {createMutation.isError && (
            <div className="mx-6 mb-6 rounded-xl bg-rose-50 p-4 text-sm text-rose-600">
              Erro ao criar convênio. Verifique os dados e tente novamente.
            </div>
          )}
        </form>
      </section>
    </div>
  );
};
