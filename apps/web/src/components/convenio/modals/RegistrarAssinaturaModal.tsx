import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, ModalButton } from '../../ui/Modal';
import { convenioService } from '../../../services/convenioService';

const schema = z.object({
  numeroTermo: z.string().min(1, 'Informe o número do termo'),
  dataAssinatura: z.string().min(1, 'Informe a data de assinatura'),
  dataInicioVigencia: z.string().min(1, 'Informe o início da vigência'),
  dataFimVigencia: z.string().min(1, 'Informe o fim da vigência')
});

type FormData = z.infer<typeof schema>;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  convenioId: number;
  onSuccess: () => void;
};

export function RegistrarAssinaturaModal({ isOpen, onClose, convenioId, onSuccess }: Props) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      convenioService.update(convenioId, {
        ...data,
        status: 'APROVADO'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convenio', String(convenioId)] });
      reset();
      onClose();
      onSuccess();
    }
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Registrar Assinatura"
      description="Informe os dados da assinatura do convênio"
      size="md"
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
            <CalendarCheck className="h-4 w-4" />
            Registrar
          </ModalButton>
        </>
      }
    >
      <form className="space-y-4">
        <div>
          <label className="form-label">Número do Termo *</label>
          <input
            className="form-input"
            {...register('numeroTermo')}
            placeholder="Ex: TC 001/2025"
          />
          {errors.numeroTermo && (
            <p className="mt-1 text-xs text-rose-500">{errors.numeroTermo.message}</p>
          )}
        </div>

        <div>
          <label className="form-label">Data de Assinatura *</label>
          <input type="date" className="form-input" {...register('dataAssinatura')} />
          {errors.dataAssinatura && (
            <p className="mt-1 text-xs text-rose-500">{errors.dataAssinatura.message}</p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="form-label">Início da Vigência *</label>
            <input type="date" className="form-input" {...register('dataInicioVigencia')} />
            {errors.dataInicioVigencia && (
              <p className="mt-1 text-xs text-rose-500">{errors.dataInicioVigencia.message}</p>
            )}
          </div>
          <div>
            <label className="form-label">Fim da Vigência *</label>
            <input type="date" className="form-input" {...register('dataFimVigencia')} />
            {errors.dataFimVigencia && (
              <p className="mt-1 text-xs text-rose-500">{errors.dataFimVigencia.message}</p>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
          <strong>Atenção:</strong> Ao registrar a assinatura, o status do convênio será
          alterado para "Aprovado".
        </div>
      </form>
    </Modal>
  );
}

