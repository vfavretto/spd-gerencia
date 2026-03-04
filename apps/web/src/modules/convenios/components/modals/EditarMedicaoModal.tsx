import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/modules/shared/ui/dialog";
import { Button } from "@/modules/shared/ui/button";
import { Input } from "@/modules/shared/ui/input";
import { Label } from "@/modules/shared/ui/label";
import { CurrencyInput } from "@/modules/shared/ui/currency-input";
import { medicaoService } from "@/modules/convenios/services/medicaoService";
import { toast } from "@/modules/shared/ui/toaster";
import type { Medicao } from "@/modules/shared/types";

const schema = z.object({
  dataMedicao: z.string().min(1, "Informe a data da medição"),
  valorMedido: z
    .number({ required_error: "Informe o valor medido" })
    .min(0.01, "Valor deve ser maior que zero"),
  percentualFisico: z.number().min(0).max(100).optional(),
  dataPagamento: z.string().optional(),
  valorPago: z.number().optional(),
  observacoes: z.string().optional(),
  situacao: z.string().optional(),
  processoMedicao: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  contratoId: string;
  convenioId: string;
  medicao: Medicao;
  onSuccess: () => void;
};

export function EditarMedicaoModal({
  isOpen,
  onClose,
  contratoId,
  convenioId,
  medicao,
  onSuccess,
}: Props) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Preencher formulário quando medicao mudar
  useEffect(() => {
    if (medicao && isOpen) {
      reset({
        dataMedicao: medicao.dataMedicao
          ? medicao.dataMedicao.split("T")[0]
          : "",
        valorMedido: Number(medicao.valorMedido) || 0,
        percentualFisico: medicao.percentualFisico
          ? Number(medicao.percentualFisico)
          : undefined,
        dataPagamento: medicao.dataPagamento
          ? medicao.dataPagamento.split("T")[0]
          : "",
        valorPago: medicao.valorPago ? Number(medicao.valorPago) : undefined,
        observacoes: medicao.observacoes || "",
        situacao: medicao.situacao || "em análise",
        processoMedicao: medicao.processoMedicao || "",
      });
    }
  }, [medicao, isOpen, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      medicaoService.update(contratoId, medicao.id, {
        dataMedicao: data.dataMedicao,
        valorMedido: data.valorMedido,
        percentualFisico: data.percentualFisico ?? null,
        dataPagamento: data.dataPagamento || null,
        valorPago: data.valorPago ?? null,
        observacoes: data.observacoes || null,
        situacao: data.situacao || null,
        processoMedicao: data.processoMedicao || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["convenio", String(convenioId)],
      });
      toast.success("Medição atualizada com sucesso!");
      onClose();
      onSuccess();
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } },
    ) => {
      const message =
        error.response?.data?.message || "Erro ao atualizar medição";
      toast.error(message);
    },
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Medição Nº {medicao.numeroMedicao}</DialogTitle>
          <DialogDescription>Altere os dados da medição</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Data e Valor */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dataMedicao">Data da Medição *</Label>
              <Input
                type="date"
                id="dataMedicao"
                {...register("dataMedicao")}
              />
              {errors.dataMedicao && (
                <p className="text-xs text-destructive">
                  {errors.dataMedicao.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Valor Medido *</Label>
              <CurrencyInput
                value={watch("valorMedido")}
                onValueChange={(value) => setValue("valorMedido", value ?? 0)}
                placeholder="R$ 0,00"
              />
              {errors.valorMedido && (
                <p className="text-xs text-destructive">
                  {errors.valorMedido.message}
                </p>
              )}
            </div>
          </div>

          {/* Percentual */}
          <div className="space-y-2">
            <Label htmlFor="percentualFisico">
              Percentual Físico Acumulado
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                id="percentualFisico"
                step="0.01"
                min="0"
                max="100"
                className="flex-1"
                {...register("percentualFisico", {
                  setValueAs: (v) => (v === "" ? undefined : Number(v)),
                })}
              />
              <span className="text-muted-foreground">%</span>
            </div>
          </div>

          {/* Pagamento */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">
              Dados do Pagamento (opcional)
            </h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dataPagamento">Data do Pagamento</Label>
                <Input
                  type="date"
                  id="dataPagamento"
                  {...register("dataPagamento")}
                />
              </div>
              <div className="space-y-2">
                <Label>Valor Pago</Label>
                <CurrencyInput
                  value={watch("valorPago")}
                  onValueChange={(value) =>
                    setValue("valorPago", value ?? undefined)
                  }
                  placeholder="R$ 0,00"
                />
              </div>
            </div>
          </div>

          {/* Situação e Processo */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="situacao">Situação</Label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                {...register("situacao")}
              >
                <option value="em análise">Em Análise</option>
                <option value="aprovada">Aprovada</option>
                <option value="rejeitada">Rejeitada</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="processoMedicao">Nº do Processo</Label>
              <Input
                id="processoMedicao"
                {...register("processoMedicao")}
                placeholder="Nº do processo da medição"
              />
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <textarea
              id="observacoes"
              className="flex min-h-[60px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              rows={2}
              {...register("observacoes")}
              placeholder="Observações sobre a medição..."
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                "Salvando..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
