import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BarChart3, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, ModalButton } from '../../ui/Modal';
import { MaskedInput } from '../../ui/MaskedInput';
import { medicaoService } from '../../../services/medicaoService';
import { formatCurrency } from '../../../utils/format';
import { useState, useEffect } from 'react';

const schema = z.object({
  dataMedicao: z.string().min(1, 'Informe a data da medição'),
  valorMedido: z.number({ required_error: 'Informe o valor medido' }).min(0.01, 'Valor deve ser maior que zero'),
  percentualFisico: z.number().min(0).max(100).optional(),
  dataPagamento: z.string().optional(),
  valorPago: z.number().optional(),
  observacoes: z.string().optional(),
  situacao: z.string().optional()
});

type FormData = z.infer<typeof schema>;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  contratoId: number;
  convenioId: number;
  dataOIS?: string | null;
  onSuccess: () => void;
};

export function NovaMedicaoModal({ isOpen, onClose, contratoId, convenioId, dataOIS, onSuccess }: Props) {
  const queryClient = useQueryClient();
  const [valorMedido, setValorMedido] = useState('');
  const [valorPago, setValorPago] = useState('');

  // Buscar saldo disponível do contrato
  const { data: saldoInfo } = useQuery({
    queryKey: ['saldo-contrato', contratoId],
    queryFn: () => medicaoService.getSaldo(contratoId),
    enabled: isOpen && contratoId > 0
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const watchedValorMedido = watch('valorMedido');

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      medicaoService.create(contratoId, {
        ...data,
        dataPagamento: data.dataPagamento || null,
        valorPago: data.valorPago || null,
        percentualFisico: data.percentualFisico || null,
        observacoes: data.observacoes || null,
        situacao: data.situacao || 'em análise',
        numeroMedicao: 0 // Será calculado pelo backend
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convenio', String(convenioId)] });
      queryClient.invalidateQueries({ queryKey: ['saldo-contrato', contratoId] });
      reset();
      setValorMedido('');
      setValorPago('');
      onClose();
      onSuccess();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erro ao criar medição';
      setError('valorMedido', { message });
    }
  });

  const onSubmit = (data: FormData) => {
    // Validação adicional: data da medição não pode ser anterior à OIS
    if (dataOIS && data.dataMedicao < dataOIS.split('T')[0]) {
      setError('dataMedicao', {
        message: 'A data da medição não pode ser anterior à Ordem de Início de Serviço (OIS)'
      });
      return;
    }

    // Validação: valor não pode exceder saldo
    if (saldoInfo && data.valorMedido > saldoInfo.saldoMedir) {
      setError('valorMedido', {
        message: `O valor excede o saldo disponível (${formatCurrency(saldoInfo.saldoMedir)})`
      });
      return;
    }

    mutation.mutate(data);
  };

  const handleClose = () => {
    reset();
    setValorMedido('');
    setValorPago('');
    onClose();
  };

  const handleValorMedidoChange = (_: string, rawValue: string) => {
    const numericValue = parseFloat(rawValue) || 0;
    setValue('valorMedido', numericValue);
    setValorMedido(rawValue);
  };

  const handleValorPagoChange = (_: string, rawValue: string) => {
    const numericValue = parseFloat(rawValue) || 0;
    setValue('valorPago', numericValue);
    setValorPago(rawValue);
  };

  // Calcular percentual automaticamente
  useEffect(() => {
    if (saldoInfo && watchedValorMedido) {
      const percentual = ((saldoInfo.totalMedido + watchedValorMedido) / saldoInfo.valorContrato) * 100;
      setValue('percentualFisico', Math.min(percentual, 100));
    }
  }, [watchedValorMedido, saldoInfo, setValue]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nova Medição"
      description="Registre uma nova medição de execução"
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
            <BarChart3 className="h-4 w-4" />
            Registrar Medição
          </ModalButton>
        </>
      }
    >
      <form className="space-y-6">
        {/* Card de Saldo Disponível */}
        {saldoInfo && (
          <div className="rounded-xl bg-slate-50 p-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">
              Saldo do Contrato
            </h4>
            <div className="grid gap-3 md:grid-cols-3 text-sm">
              <div>
                <p className="text-slate-500">Valor do Contrato</p>
                <p className="font-semibold text-slate-900">
                  {formatCurrency(saldoInfo.valorContrato)}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Já Medido</p>
                <p className="font-semibold text-primary-600">
                  {formatCurrency(saldoInfo.totalMedido)}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Saldo Disponível</p>
                <p className="font-bold text-emerald-600">
                  {formatCurrency(saldoInfo.saldoMedir)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Aviso sobre OIS */}
        {dataOIS && (
          <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Atenção:</strong> A data da medição não pode ser anterior à OIS (
              {new Date(dataOIS).toLocaleDateString('pt-BR')}).
            </div>
          </div>
        )}

        {/* Data e Valor */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="form-label">Data da Medição *</label>
            <input
              type="date"
              className="form-input"
              {...register('dataMedicao')}
              min={dataOIS ? dataOIS.split('T')[0] : undefined}
            />
            {errors.dataMedicao && (
              <p className="mt-1 text-xs text-rose-500">{errors.dataMedicao.message}</p>
            )}
          </div>
          <div>
            <MaskedInput
              mask="currency"
              label="Valor Medido *"
              placeholder="R$ 0,00"
              value={valorMedido}
              onChange={handleValorMedidoChange}
              error={errors.valorMedido?.message}
            />
          </div>
        </div>

        {/* Percentual (calculado automaticamente) */}
        <div>
          <label className="form-label">Percentual Físico Acumulado</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              className="form-input flex-1"
              {...register('percentualFisico', {
                setValueAs: (v) => (v === '' ? undefined : Number(v))
              })}
            />
            <span className="text-slate-500">%</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Calculado automaticamente com base no valor</p>
        </div>

        {/* Pagamento */}
        <div className="space-y-4">
          <h4 className="font-medium text-slate-700">Dados do Pagamento (opcional)</h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="form-label">Data do Pagamento</label>
              <input type="date" className="form-input" {...register('dataPagamento')} />
            </div>
            <div>
              <MaskedInput
                mask="currency"
                label="Valor Pago"
                placeholder="R$ 0,00"
                value={valorPago}
                onChange={handleValorPagoChange}
              />
            </div>
          </div>
        </div>

        {/* Situação */}
        <div>
          <label className="form-label">Situação</label>
          <select className="form-input" {...register('situacao')}>
            <option value="em análise">Em Análise</option>
            <option value="aprovada">Aprovada</option>
            <option value="rejeitada">Rejeitada</option>
          </select>
        </div>

        {/* Observações */}
        <div>
          <label className="form-label">Observações</label>
          <textarea
            className="form-input"
            rows={2}
            {...register('observacoes')}
            placeholder="Observações sobre a medição..."
          />
        </div>
      </form>
    </Modal>
  );
}

