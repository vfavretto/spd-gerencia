import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Building, FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CurrencyInput } from '@/components/ui/currency-input';
import { contratoService } from '@/services/contratoService';
import { toast } from '@/components/ui/toaster';

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
  convenioId: string;
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
      toast.success('Contrato vinculado com sucesso!');
      reset();
      onClose();
      onSuccess();
    },
    onError: () => {
      toast.error('Erro ao vincular contrato');
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vincular Contrato</DialogTitle>
          <DialogDescription>
            Cadastre o contrato de execução vinculado ao convênio
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Seção: Licitação */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Dados da Licitação
            </h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="numProcessoLicitatorio">Nº Processo Licitatório</Label>
                <Input
                  id="numProcessoLicitatorio"
                  {...register('numProcessoLicitatorio')}
                  placeholder="Ex: PL 001/2025"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modalidadeLicitacao">Modalidade</Label>
                <select
                  id="modalidadeLicitacao"
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  {...register('modalidadeLicitacao')}
                >
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
            <h4 className="font-medium flex items-center gap-2">
              <Building className="h-4 w-4" />
              Dados do Contrato
            </h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="numeroContrato">Número do Contrato *</Label>
                <Input
                  id="numeroContrato"
                  {...register('numeroContrato')}
                  placeholder="Ex: CT 001/2025"
                />
                {errors.numeroContrato && (
                  <p className="text-xs text-destructive">{errors.numeroContrato.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Valor do Contrato *</Label>
                <CurrencyInput
                  value={watch('valorContrato')}
                  onValueChange={(value) => setValue('valorContrato', value ?? 0)}
                  placeholder="R$ 0,00"
                />
                {errors.valorContrato && (
                  <p className="text-xs text-destructive">{errors.valorContrato.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Seção: Contratada */}
          <div className="space-y-4">
            <h4 className="font-medium">Empresa Contratada</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contratadaNome">Nome/Razão Social *</Label>
                <Input
                  id="contratadaNome"
                  {...register('contratadaNome')}
                  placeholder="Nome da empresa"
                />
                {errors.contratadaNome && (
                  <p className="text-xs text-destructive">{errors.contratadaNome.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contratadaCnpj">CNPJ</Label>
                <Input
                  id="contratadaCnpj"
                  {...register('contratadaCnpj')}
                  placeholder="00.000.000/0000-00"
                />
              </div>
            </div>
          </div>

          {/* Seção: Datas */}
          <div className="space-y-4">
            <h4 className="font-medium">Datas Importantes</h4>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="dataAssinatura">Assinatura</Label>
                <Input type="date" id="dataAssinatura" {...register('dataAssinatura')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataVigenciaInicio">Início Vigência</Label>
                <Input type="date" id="dataVigenciaInicio" {...register('dataVigenciaInicio')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataVigenciaFim">Fim Vigência</Label>
                <Input type="date" id="dataVigenciaFim" {...register('dataVigenciaFim')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataOIS">OIS</Label>
                <Input type="date" id="dataOIS" {...register('dataOIS')} />
                <p className="text-xs text-muted-foreground">Ordem de Início de Serviço</p>
              </div>
            </div>
          </div>

          {/* Seção: Engenharia */}
          <div className="space-y-4">
            <h4 className="font-medium">Responsável Técnico</h4>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="engenheiroResponsavel">Engenheiro</Label>
                <Input
                  id="engenheiroResponsavel"
                  {...register('engenheiroResponsavel')}
                  placeholder="Nome completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="creaEngenheiro">CREA</Label>
                <Input
                  id="creaEngenheiro"
                  {...register('creaEngenheiro')}
                  placeholder="Nº do CREA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="artRrt">ART/RRT</Label>
                <Input
                  id="artRrt"
                  {...register('artRrt')}
                  placeholder="Nº da ART ou RRT"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                'Vinculando...'
              ) : (
                <>
                  <Building className="h-4 w-4 mr-2" />
                  Vincular Contrato
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
