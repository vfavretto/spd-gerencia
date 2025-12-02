import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FileSignature, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, ModalButton } from '../../ui/Modal';
import { MaskedInput } from '../../ui/MaskedInput';
import { aditivoService } from '../../../services/aditivoService';
import { useState } from 'react';
import type { TipoAditivo } from '../../../types';

const schema = z.object({
  tipoAditivo: z.enum(['PRAZO', 'VALOR', 'PRAZO_E_VALOR', 'SUPRESSAO', 'ACRESCIMO'], {
    required_error: 'Selecione o tipo de aditivo'
  }),
  dataAssinatura: z.string().optional(),
  novaVigencia: z.string().optional(),
  valorAcrescimo: z.number().optional(),
  valorSupressao: z.number().optional(),
  motivo: z.string().min(1, 'Informe o motivo do aditivo'),
  justificativa: z.string().optional(),
  observacoes: z.string().optional()
});

type FormData = z.infer<typeof schema>;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  convenioId: number;
  vigenciaAtual?: string | null;
  numeroAditivos: number;
  onSuccess: () => void;
};

const tipoAditivoOptions: { value: TipoAditivo; label: string; description: string }[] = [
  { value: 'PRAZO', label: 'Prazo', description: 'Prorrogação do prazo de vigência' },
  { value: 'VALOR', label: 'Valor', description: 'Alteração no valor do convênio' },
  { value: 'PRAZO_E_VALOR', label: 'Prazo e Valor', description: 'Alteração de prazo e valor' },
  { value: 'ACRESCIMO', label: 'Acréscimo', description: 'Acréscimo de valor ao contrato' },
  { value: 'SUPRESSAO', label: 'Supressão', description: 'Redução de valor do contrato' }
];

export function AditivarModal({
  isOpen,
  onClose,
  convenioId,
  vigenciaAtual,
  numeroAditivos,
  onSuccess
}: Props) {
  const queryClient = useQueryClient();
  const [valorAcrescimo, setValorAcrescimo] = useState('');
  const [valorSupressao, setValorSupressao] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const tipoAditivo = watch('tipoAditivo');

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      aditivoService.create(convenioId, {
        ...data,
        numeroAditivo: numeroAditivos + 1,
        dataAssinatura: data.dataAssinatura || null,
        novaVigencia: data.novaVigencia || null,
        valorAcrescimo: data.valorAcrescimo || null,
        valorSupressao: data.valorSupressao || null,
        justificativa: data.justificativa || null,
        observacoes: data.observacoes || null
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convenio', String(convenioId)] });
      queryClient.invalidateQueries({ queryKey: ['vigencia', String(convenioId)] });
      reset();
      setValorAcrescimo('');
      setValorSupressao('');
      onClose();
      onSuccess();
    }
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  const handleClose = () => {
    reset();
    setValorAcrescimo('');
    setValorSupressao('');
    onClose();
  };

  const handleValorAcrescimoChange = (_: string, rawValue: string) => {
    const numericValue = parseFloat(rawValue) || 0;
    setValue('valorAcrescimo', numericValue);
    setValorAcrescimo(rawValue);
  };

  const handleValorSupressaoChange = (_: string, rawValue: string) => {
    const numericValue = parseFloat(rawValue) || 0;
    setValue('valorSupressao', numericValue);
    setValorSupressao(rawValue);
  };

  const showPrazoFields = ['PRAZO', 'PRAZO_E_VALOR'].includes(tipoAditivo);
  const showValorFields = ['VALOR', 'PRAZO_E_VALOR', 'ACRESCIMO', 'SUPRESSAO'].includes(tipoAditivo);
  const showAcrescimo = ['VALOR', 'PRAZO_E_VALOR', 'ACRESCIMO'].includes(tipoAditivo);
  const showSupressao = ['VALOR', 'PRAZO_E_VALOR', 'SUPRESSAO'].includes(tipoAditivo);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Novo Aditivo (${numeroAditivos + 1}º)`}
      description="Registre um aditivo ao convênio"
      size="lg"
      footer={
        <>
          <ModalButton variant="secondary" onClick={handleClose}>
            Cancelar
          </ModalButton>
          <ModalButton
            variant="primary"
            onClick={handleSubmit(onSubmit)}
            loading={mutation.isPending}
          >
            <FileSignature className="h-4 w-4" />
            Registrar Aditivo
          </ModalButton>
        </>
      }
    >
      <form className="space-y-6">
        {/* Aviso */}
        <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-700 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <strong>Importante:</strong> Os aditivos criam um histórico de alterações e não modificam
            os valores originais do convênio. Para aditivos de prazo, a nova vigência será considerada
            como a vigência atual.
          </div>
        </div>

        {/* Vigência Atual */}
        {vigenciaAtual && (
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Vigência Atual</p>
            <p className="text-lg font-semibold text-slate-900">
              {new Date(vigenciaAtual).toLocaleDateString('pt-BR')}
            </p>
          </div>
        )}

        {/* Tipo de Aditivo */}
        <div>
          <label className="form-label">Tipo de Aditivo *</label>
          <div className="grid gap-2 md:grid-cols-2">
            {tipoAditivoOptions.map((option) => (
              <label
                key={option.value}
                className={`
                  flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3 transition
                  ${
                    tipoAditivo === option.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }
                `}
              >
                <input
                  type="radio"
                  value={option.value}
                  {...register('tipoAditivo')}
                  className="mt-0.5"
                />
                <div>
                  <p className="font-medium text-slate-900">{option.label}</p>
                  <p className="text-xs text-slate-500">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
          {errors.tipoAditivo && (
            <p className="mt-1 text-xs text-rose-500">{errors.tipoAditivo.message}</p>
          )}
        </div>

        {/* Data de Assinatura */}
        <div>
          <label className="form-label">Data de Assinatura</label>
          <input type="date" className="form-input" {...register('dataAssinatura')} />
        </div>

        {/* Campos de Prazo */}
        {showPrazoFields && (
          <div>
            <label className="form-label">Nova Vigência *</label>
            <input
              type="date"
              className="form-input"
              {...register('novaVigencia')}
              min={vigenciaAtual ? vigenciaAtual.split('T')[0] : undefined}
            />
            <p className="mt-1 text-xs text-slate-500">
              A nova data de fim de vigência do convênio
            </p>
          </div>
        )}

        {/* Campos de Valor */}
        {showValorFields && (
          <div className="grid gap-4 md:grid-cols-2">
            {showAcrescimo && (
              <div>
                <MaskedInput
                  mask="currency"
                  label="Valor de Acréscimo"
                  placeholder="R$ 0,00"
                  value={valorAcrescimo}
                  onChange={handleValorAcrescimoChange}
                />
              </div>
            )}
            {showSupressao && (
              <div>
                <MaskedInput
                  mask="currency"
                  label="Valor de Supressão"
                  placeholder="R$ 0,00"
                  value={valorSupressao}
                  onChange={handleValorSupressaoChange}
                />
              </div>
            )}
          </div>
        )}

        {/* Motivo */}
        <div>
          <label className="form-label">Motivo *</label>
          <textarea
            className="form-input"
            rows={2}
            {...register('motivo')}
            placeholder="Descreva o motivo do aditivo..."
          />
          {errors.motivo && (
            <p className="mt-1 text-xs text-rose-500">{errors.motivo.message}</p>
          )}
        </div>

        {/* Justificativa */}
        <div>
          <label className="form-label">Justificativa Técnica/Legal</label>
          <textarea
            className="form-input"
            rows={2}
            {...register('justificativa')}
            placeholder="Fundamento legal ou técnico para o aditivo..."
          />
        </div>

        {/* Observações */}
        <div>
          <label className="form-label">Observações</label>
          <textarea
            className="form-input"
            rows={2}
            {...register('observacoes')}
          />
        </div>
      </form>
    </Modal>
  );
}

