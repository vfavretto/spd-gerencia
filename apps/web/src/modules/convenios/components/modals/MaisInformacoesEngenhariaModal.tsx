import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/modules/shared/ui/dialog";
import { Button } from "@/modules/shared/ui/button";
import { Label } from "@/modules/shared/ui/label";
import { CurrencyInput } from "@/modules/shared/ui/currency-input";
import { financeiroService } from "@/modules/convenios/services/financeiroService";
import { formatCurrency } from "@/modules/shared/utils/format";
import { toast } from "@/modules/shared/ui/toaster";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  convenioId: string;
  repasseBase: number;
  contrapartidaBase: number;
  repasseAtual: number;
  contrapartidaAtual: number;
  valorCPExclusivaAtual: number;
  onSuccess: () => void;
};

type FormData = {
  repasseVigente: number;
  contrapartidaVigente: number;
  valorCPExclusiva: number;
};

const roundCurrency = (value: number) => Math.round(value * 100) / 100;

export function MaisInformacoesEngenhariaModal({
  isOpen,
  onClose,
  convenioId,
  repasseBase,
  contrapartidaBase,
  repasseAtual,
  contrapartidaAtual,
  valorCPExclusivaAtual,
  onSuccess
}: Props) {
  const queryClient = useQueryClient();

  const { control, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      repasseVigente: repasseAtual,
      contrapartidaVigente: contrapartidaAtual,
      valorCPExclusiva: valorCPExclusivaAtual
    }
  });

  useEffect(() => {
    reset({
      repasseVigente: repasseAtual,
      contrapartidaVigente: contrapartidaAtual,
      valorCPExclusiva: valorCPExclusivaAtual
    });
  }, [repasseAtual, contrapartidaAtual, valorCPExclusivaAtual, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const ajusteRepasseVigente = roundCurrency((data.repasseVigente || 0) - repasseBase);
      const ajusteContrapartidaVigente = roundCurrency((data.contrapartidaVigente || 0) - contrapartidaBase);

      return financeiroService.upsert(convenioId, {
        ajusteRepasseVigente,
        ajusteContrapartidaVigente,
        valorCPExclusiva: data.valorCPExclusiva || 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["convenio", String(convenioId)] });
      queryClient.invalidateQueries({ queryKey: ["convenio-valores-vigentes", String(convenioId)] });
      toast.success("Mais informações atualizadas com sucesso!");
      onClose();
      onSuccess();
    },
    onError: () => {
      toast.error("Erro ao salvar mais informações");
    }
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Mais Informações
          </DialogTitle>
          <DialogDescription>
            Ajuste os valores vigentes da engenharia mantendo o cálculo automático como base.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p>Base automática do sistema:</p>
            <p className="mt-1">Repasse: <strong>{formatCurrency(repasseBase)}</strong></p>
            <p>Contrapartida: <strong>{formatCurrency(contrapartidaBase)}</strong></p>
          </div>

          <div className="space-y-2">
            <Label>Repasse Vigente</Label>
            <Controller
              control={control}
              name="repasseVigente"
              render={({ field }) => (
                <CurrencyInput
                  value={field.value ?? 0}
                  onValueChange={(value) => field.onChange(value ?? 0)}
                  placeholder="R$ 0,00"
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Contrapartida Vigente</Label>
            <Controller
              control={control}
              name="contrapartidaVigente"
              render={({ field }) => (
                <CurrencyInput
                  value={field.value ?? 0}
                  onValueChange={(value) => field.onChange(value ?? 0)}
                  placeholder="R$ 0,00"
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>CP Exclusiva/Recurso Próprio</Label>
            <Controller
              control={control}
              name="valorCPExclusiva"
              render={({ field }) => (
                <CurrencyInput
                  value={field.value ?? 0}
                  onValueChange={(value) => field.onChange(value ?? 0)}
                  placeholder="R$ 0,00"
                />
              )}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
