import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart3, AlertCircle } from "lucide-react";
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
import { formatCurrency } from "@/modules/shared/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/modules/shared/ui/card";
import { medicaoService } from "@/modules/convenios/services/medicaoService";
import { toast } from "@/modules/shared/ui/toaster";
import { formatDateBR } from "@/modules/shared/lib/date";

const schema = z.object({
  dataMedicao: z.string().min(1, "Informe a data da medição"),
  valorMedido: z.number({ required_error: "Informe o valor medido" }).min(0.01, "Valor deve ser maior que zero"),
  percentualFisico: z.number().min(0).max(100).optional(),
  dataPagamento: z.string().optional(),
  valorPago: z.number().optional(),
  observacoes: z.string().optional(),
  situacao: z.string().optional(),
  processoMedicao: z.string().optional()
});

type FormData = z.infer<typeof schema>;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  contratoId: string;
  convenioId: string;
  dataOIS?: string | null;
  onSuccess: () => void;
};

export function NovaMedicaoModal({ isOpen, onClose, contratoId, convenioId, dataOIS, onSuccess }: Props) {
  const queryClient = useQueryClient();

  // Buscar saldo disponível do contrato
  const { data: saldoInfo } = useQuery({
    queryKey: ["saldo-contrato", contratoId],
    queryFn: () => medicaoService.getSaldo(contratoId),
    enabled: isOpen && !!contratoId
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

  const watchedValorMedido = watch("valorMedido");

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      medicaoService.create(contratoId, {
        ...data,
        dataPagamento: data.dataPagamento || null,
        valorPago: data.valorPago || null,
        percentualFisico: data.percentualFisico || null,
        observacoes: data.observacoes || null,
        situacao: data.situacao || "em análise",
        processoMedicao: data.processoMedicao || null,
        numeroMedicao: 0 // Será calculado pelo backend
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["convenio", String(convenioId)] });
      queryClient.invalidateQueries({ queryKey: ["saldo-contrato", contratoId] });
      toast.success("Medição registrada com sucesso!");
      reset();
      onClose();
      onSuccess();
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message || "Erro ao criar medição";
      toast.error(message);
      setError("valorMedido", { message });
    }
  });

  const onSubmit = (data: FormData) => {
    // Validação adicional: data da medição não pode ser anterior à OIS
    if (dataOIS && data.dataMedicao < dataOIS.split("T")[0]) {
      setError("dataMedicao", {
        message: "A data da medição não pode ser anterior à Ordem de Início de Serviço (OIS)"
      });
      return;
    }

    // Validação: valor não pode exceder saldo
    if (saldoInfo && data.valorMedido > saldoInfo.saldoMedir) {
      setError("valorMedido", {
        message: `O valor excede o saldo disponível (${formatCurrency(saldoInfo.saldoMedir)})`
      });
      return;
    }

    mutation.mutate(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Calcular percentual automaticamente
  useEffect(() => {
    if (saldoInfo && watchedValorMedido) {
      const percentual = ((saldoInfo.totalMedido + watchedValorMedido) / saldoInfo.valorContrato) * 100;
      setValue("percentualFisico", Math.min(percentual, 100));
    }
  }, [watchedValorMedido, saldoInfo, setValue]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova Medição</DialogTitle>
          <DialogDescription>
            Registre uma nova medição de execução
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Card de Saldo Disponível */}
          {saldoInfo && (
            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Saldo do Contrato</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Valor do Contrato</p>
                    <p className="font-semibold">{formatCurrency(saldoInfo.valorContrato)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Já Medido</p>
                    <p className="font-semibold text-primary">{formatCurrency(saldoInfo.totalMedido)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Saldo Disponível</p>
                    <p className="font-bold text-emerald-600">{formatCurrency(saldoInfo.saldoMedir)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Aviso sobre OIS */}
          {dataOIS && (
            <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Atenção:</strong> A data da medição não pode ser anterior à OIS ({formatDateBR(dataOIS)}).
              </div>
            </div>
          )}

          {/* Data e Valor */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dataMedicao">Data da Medição *</Label>
              <Input
                type="date"
                id="dataMedicao"
                {...register("dataMedicao")}
                min={dataOIS ? dataOIS.split("T")[0] : undefined}
              />
              {errors.dataMedicao && (
                <p className="text-xs text-destructive">{errors.dataMedicao.message}</p>
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
                <p className="text-xs text-destructive">{errors.valorMedido.message}</p>
              )}
            </div>
          </div>

          {/* Percentual (calculado automaticamente) */}
          <div className="space-y-2">
            <Label htmlFor="percentualFisico">Percentual Físico Acumulado</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                id="percentualFisico"
                step="0.01"
                min="0"
                max="100"
                className="flex-1"
                {...register("percentualFisico", {
                  setValueAs: (v) => (v === "" ? undefined : Number(v))
                })}
              />
              <span className="text-muted-foreground">%</span>
            </div>
            <p className="text-xs text-muted-foreground">Calculado automaticamente com base no valor</p>
          </div>

          {/* Pagamento */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Dados do Pagamento (opcional)</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dataPagamento">Data do Pagamento</Label>
                <Input type="date" id="dataPagamento" {...register("dataPagamento")} />
              </div>
              <div className="space-y-2">
                <Label>Valor Pago</Label>
                <CurrencyInput
                  value={watch("valorPago")}
                  onValueChange={(value) => setValue("valorPago", value ?? undefined)}
                  placeholder="R$ 0,00"
                />
              </div>
            </div>
          </div>

          {/* Situação e Processo */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="situacao">Situação</Label>
              <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" {...register("situacao")}>
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
                "Registrando..."
              ) : (
                <>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Registrar Medição
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
