import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Building, FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, ModalButton } from '../../ui/Modal';
import { MaskedInput } from '../../ui/MaskedInput';
import { contratoService } from '../../../services/contratoService';
import { useState } from 'react';

const schema = z.object({
  numProcessoLicitatorio: z.string().optional(),
  modalidadeLicitacao: z.enum([
    'PREGAO',
    'TOMADA_PRECOS',
    'CONCORRENCIA',
    'DISPENSA',
    'INEXIGIBILIDADE'
  ]).optional(),
  numeroContrato: z.string().min(1, 'Informe o número do contrato'),
  contratadaCnpj: z.string().optional(),
  contratadaNome: z.string().min(1, 'Informe o nome da contratada'),
  dataAssinatura: z.string().optional(),
  dataVigenciaInicio: z.string().optional(),
  dataVigenciaFim: z.string().optional(),
  dataOIS: z.string().optional(),
  valorContrato: z.number({ required_error: 'Informe o valor do contrato' }).min(0),
  engenheiroResponsavel: z.string().optional(),
  creaEngenheiro: z.string().optional(),
  artRrt: z.string().optional()
});

type FormData = z.infer<typeof schema>;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  convenioId: number;
  onSuccess: () => void;
};

const modalidadeOptions = [
  { value: 'PREGAO', label: 'Pregão' },
  { value: 'TOMADA_PRECOS', label: 'Tomada de Preços' },
  { value: 'CONCORRENCIA', label: 'Concorrência' },
  { value: 'DISPENSA', label: 'Dispensa' },
  { value: 'INEXIGIBILIDADE', label: 'Inexigibilidade' }
];

export function VincularContratoModal({ isOpen, onClose, convenioId, onSuccess }: Props) {
  const queryClient = useQueryClient();
  const [valorContrato, setValorContrato] = useState('');
  const [cnpjValue, setCnpjValue] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      contratoService.create(convenioId, {
        ...data,
        dataAssinatura: data.dataAssinatura || null,
        dataVigenciaInicio: data.dataVigenciaInicio || null,
        dataVigenciaFim: data.dataVigenciaFim || null,
        dataOIS: data.dataOIS || null,
        modalidadeLicitacao: data.modalidadeLicitacao || null,
        numProcessoLicitatorio: data.numProcessoLicitatorio || null,
        engenheiroResponsavel: data.engenheiroResponsavel || null,
        creaEngenheiro: data.creaEngenheiro || null,
        artRrt: data.artRrt || null,
        contratadaCnpj: data.contratadaCnpj || null
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['convenio', String(convenioId)] });
      reset();
      setValorContrato('');
      setCnpjValue('');
      onClose();
      onSuccess();
    }
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  const handleClose = () => {
    reset();
    setValorContrato('');
    setCnpjValue('');
    onClose();
  };

  const handleCurrencyChange = (_: string, rawValue: string) => {
    const numericValue = parseFloat(rawValue) || 0;
    setValue('valorContrato', numericValue);
    setValorContrato(rawValue);
  };

  const handleCnpjChange = (maskedValue: string, _rawValue: string) => {
    setValue('contratadaCnpj', maskedValue);
    setCnpjValue(maskedValue);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Vincular Contrato"
      description="Cadastre o contrato de execução vinculado ao convênio"
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
            <Building className="h-4 w-4" />
            Vincular Contrato
          </ModalButton>
        </>
      }
    >
      <form className="space-y-6">
        {/* Seção: Licitação */}
        <div className="space-y-4">
          <h4 className="font-medium text-slate-700 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Dados da Licitação
          </h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="form-label">Nº Processo Licitatório</label>
              <input
                className="form-input"
                {...register('numProcessoLicitatorio')}
                placeholder="Ex: PL 001/2025"
              />
            </div>
            <div>
              <label className="form-label">Modalidade</label>
              <select className="form-input" {...register('modalidadeLicitacao')}>
                <option value="">Selecione</option>
                {modalidadeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Seção: Contrato */}
        <div className="space-y-4">
          <h4 className="font-medium text-slate-700 flex items-center gap-2">
            <Building className="h-4 w-4" />
            Dados do Contrato
          </h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="form-label">Número do Contrato *</label>
              <input
                className="form-input"
                {...register('numeroContrato')}
                placeholder="Ex: CT 001/2025"
              />
              {errors.numeroContrato && (
                <p className="mt-1 text-xs text-rose-500">{errors.numeroContrato.message}</p>
              )}
            </div>
            <div>
              <MaskedInput
                mask="currency"
                label="Valor do Contrato *"
                placeholder="R$ 0,00"
                value={valorContrato}
                onChange={handleCurrencyChange}
                error={errors.valorContrato?.message}
              />
            </div>
          </div>
        </div>

        {/* Seção: Contratada */}
        <div className="space-y-4">
          <h4 className="font-medium text-slate-700">Empresa Contratada</h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="form-label">Nome/Razão Social *</label>
              <input
                className="form-input"
                {...register('contratadaNome')}
                placeholder="Nome da empresa"
              />
              {errors.contratadaNome && (
                <p className="mt-1 text-xs text-rose-500">{errors.contratadaNome.message}</p>
              )}
            </div>
            <div>
              <MaskedInput
                mask="cnpj"
                label="CNPJ"
                placeholder="00.000.000/0000-00"
                value={cnpjValue}
                onChange={handleCnpjChange}
              />
            </div>
          </div>
        </div>

        {/* Seção: Datas */}
        <div className="space-y-4">
          <h4 className="font-medium text-slate-700">Datas Importantes</h4>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="form-label">Assinatura</label>
              <input type="date" className="form-input" {...register('dataAssinatura')} />
            </div>
            <div>
              <label className="form-label">Início Vigência</label>
              <input type="date" className="form-input" {...register('dataVigenciaInicio')} />
            </div>
            <div>
              <label className="form-label">Fim Vigência</label>
              <input type="date" className="form-input" {...register('dataVigenciaFim')} />
            </div>
            <div>
              <label className="form-label">OIS</label>
              <input type="date" className="form-input" {...register('dataOIS')} />
              <p className="mt-1 text-xs text-slate-500">Ordem de Início de Serviço</p>
            </div>
          </div>
        </div>

        {/* Seção: Engenharia */}
        <div className="space-y-4">
          <h4 className="font-medium text-slate-700">Responsável Técnico</h4>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="form-label">Engenheiro</label>
              <input
                className="form-input"
                {...register('engenheiroResponsavel')}
                placeholder="Nome completo"
              />
            </div>
            <div>
              <label className="form-label">CREA</label>
              <input
                className="form-input"
                {...register('creaEngenheiro')}
                placeholder="Nº do CREA"
              />
            </div>
            <div>
              <label className="form-label">ART/RRT</label>
              <input
                className="form-input"
                {...register('artRrt')}
                placeholder="Nº da ART ou RRT"
              />
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}

