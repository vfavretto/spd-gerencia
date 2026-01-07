import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FileSignature, AlertTriangle } from 'lucide-react';
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
import { Card, CardContent } from '@/components/ui/card';
import { aditivoService } from '@/services/aditivoService';
import { toast } from '@/components/ui/toaster';
import { formatDateBR } from '@/lib/date';
import type { TipoAditivo } from '@/types';

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
  convenioId: string;
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
      toast.success('Aditivo registrado com sucesso!');
      reset();
      onClose();
      onSuccess();
    },
    onError: () => {
      toast.error('Erro ao registrar aditivo');
    }
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const showPrazoFields = ['PRAZO', 'PRAZO_E_VALOR'].includes(tipoAditivo);
  const showValorFields = ['VALOR', 'PRAZO_E_VALOR', 'ACRESCIMO', 'SUPRESSAO'].includes(tipoAditivo);
  const showAcrescimo = ['VALOR', 'PRAZO_E_VALOR', 'ACRESCIMO'].includes(tipoAditivo);
  const showSupressao = ['VALOR', 'PRAZO_E_VALOR', 'SUPRESSAO'].includes(tipoAditivo);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{`Novo Aditivo (${numeroAditivos + 1}º)`}</DialogTitle>
          <DialogDescription>
            Registre um aditivo ao convênio
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Aviso */}
          <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-700 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Importante:</strong> Os aditivos criam um histórico de alterações e não modificam
              os valores originais do convênio. Para aditivos de prazo, a nova vigência será considerada
              como a vigência atual.
            </div>
          </div>

          {/* Vigência Atual */}
          {vigenciaAtual && (
            <Card className="bg-muted/50">
              <CardContent className="py-4">
                <p className="text-sm text-muted-foreground">Vigência Atual</p>
                <p className="text-lg font-semibold">{formatDateBR(vigenciaAtual)}</p>
              </CardContent>
            </Card>
          )}

          {/* Tipo de Aditivo */}
          <div className="space-y-2">
            <Label>Tipo de Aditivo *</Label>
            <div className="grid gap-2 md:grid-cols-2">
              {tipoAditivoOptions.map((option) => (
                <label
                  key={option.value}
                  className={`
                    flex cursor-pointer items-start gap-3 rounded-lg border-2 p-3 transition
                    ${
                      tipoAditivo === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground/30'
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
                    <p className="font-medium">{option.label}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
            {errors.tipoAditivo && (
              <p className="text-xs text-destructive">{errors.tipoAditivo.message}</p>
            )}
          </div>

          {/* Data de Assinatura */}
          <div className="space-y-2">
            <Label htmlFor="dataAssinatura">Data de Assinatura</Label>
            <Input type="date" id="dataAssinatura" {...register('dataAssinatura')} />
          </div>

          {/* Campos de Prazo */}
          {showPrazoFields && (
            <div className="space-y-2">
              <Label htmlFor="novaVigencia">Nova Vigência *</Label>
              <Input
                type="date"
                id="novaVigencia"
                {...register('novaVigencia')}
                min={vigenciaAtual ? vigenciaAtual.split('T')[0] : undefined}
              />
              <p className="text-xs text-muted-foreground">
                A nova data de fim de vigência do convênio
              </p>
            </div>
          )}

          {/* Campos de Valor */}
          {showValorFields && (
            <div className="grid gap-4 md:grid-cols-2">
              {showAcrescimo && (
                <div className="space-y-2">
                  <Label>Valor de Acréscimo</Label>
                  <CurrencyInput
                    value={watch('valorAcrescimo')}
                    onValueChange={(value) => setValue('valorAcrescimo', value ?? undefined)}
                    placeholder="R$ 0,00"
                  />
                </div>
              )}
              {showSupressao && (
                <div className="space-y-2">
                  <Label>Valor de Supressão</Label>
                  <CurrencyInput
                    value={watch('valorSupressao')}
                    onValueChange={(value) => setValue('valorSupressao', value ?? undefined)}
                    placeholder="R$ 0,00"
                  />
                </div>
              )}
            </div>
          )}

          {/* Motivo */}
          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo *</Label>
            <textarea
              id="motivo"
              className="flex min-h-[60px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              rows={2}
              {...register('motivo')}
              placeholder="Descreva o motivo do aditivo..."
            />
            {errors.motivo && (
              <p className="text-xs text-destructive">{errors.motivo.message}</p>
            )}
          </div>

          {/* Justificativa */}
          <div className="space-y-2">
            <Label htmlFor="justificativa">Justificativa Técnica/Legal</Label>
            <textarea
              id="justificativa"
              className="flex min-h-[60px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              rows={2}
              {...register('justificativa')}
              placeholder="Fundamento legal ou técnico para o aditivo..."
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <textarea
              id="observacoes"
              className="flex min-h-[60px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              rows={2}
              {...register('observacoes')}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                'Registrando...'
              ) : (
                <>
                  <FileSignature className="h-4 w-4 mr-2" />
                  Registrar Aditivo
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
