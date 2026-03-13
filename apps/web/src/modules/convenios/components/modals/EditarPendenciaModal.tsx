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
import { pendenciaService } from "@/modules/convenios/services/pendenciaService";
import { toast } from "@/modules/shared/ui/toaster";
import type { Pendencia } from "@/modules/shared/types";

const schema = z.object({
  descricao: z.string().min(1, "Descrição é obrigatória"),
  responsavel: z.string().optional(),
  orgaoResponsavel: z.string().optional(),
  prazo: z.string().optional(),
  prioridade: z.coerce.number().int().min(1).max(3),
  status: z.enum(["ABERTA", "EM_ANDAMENTO", "RESOLVIDA", "CANCELADA"]),
  resolucao: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  convenioId: string;
  pendencia: Pendencia;
  onSuccess: () => void;
};

export function EditarPendenciaModal({
  isOpen,
  onClose,
  convenioId,
  pendencia,
  onSuccess,
}: Props) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const statusAtual = watch("status");

  // Preencher formulário quando a pendência mudar
  useEffect(() => {
    if (pendencia) {
      reset({
        descricao: pendencia.descricao,
        responsavel: pendencia.responsavel || "",
        orgaoResponsavel: pendencia.orgaoResponsavel || "",
        prazo: pendencia.prazo
          ? new Date(pendencia.prazo).toISOString().split("T")[0]
          : "",
        prioridade: pendencia.prioridade || 2,
        status: pendencia.status,
        resolucao: pendencia.resolucao || "",
      });
    }
  }, [pendencia, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: FormData) =>
      pendenciaService.update(convenioId, pendencia.id, {
        descricao: data.descricao,
        responsavel: data.responsavel || null,
        orgaoResponsavel: data.orgaoResponsavel || null,
        prazo: data.prazo || null,
        prioridade: data.prioridade,
        status: data.status,
        resolucao: data.resolucao || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["convenio", String(convenioId)],
      });
      queryClient.invalidateQueries({
        queryKey: ["agenda"],
      });
      toast.success("Pendência atualizada com sucesso!");
      reset();
      onClose();
      onSuccess();
    },
    onError: () => {
      toast.error("Erro ao atualizar pendência");
    },
  });

  const onSubmit = (data: FormData) => {
    updateMutation.mutate(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Pendência</DialogTitle>
          <DialogDescription>
            Atualize as informações da pendência
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Descrição *</Label>
            <textarea
              className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              rows={3}
              {...register("descricao")}
              placeholder="Descreva a pendência ou problema..."
            />
            {errors.descricao && (
              <p className="text-xs text-destructive">
                {errors.descricao.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Responsável</Label>
              <Input
                {...register("responsavel")}
                placeholder="Quem deve resolver?"
              />
            </div>
            <div className="space-y-2">
              <Label>Órgão Responsável</Label>
              <Input
                {...register("orgaoResponsavel")}
                placeholder="Ex: SPD, Secretaria X"
              />
            </div>
            <div className="space-y-2">
              <Label>Prazo</Label>
              <Input type="date" {...register("prazo")} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                {...register("prioridade")}
              >
                <option value={1}>Alta</option>
                <option value={2}>Média</option>
                <option value={3}>Baixa</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                {...register("status")}
              >
                <option value="ABERTA">Aberta</option>
                <option value="EM_ANDAMENTO">Em Andamento</option>
                <option value="RESOLVIDA">Resolvida</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
            </div>
          </div>

          {(statusAtual === "RESOLVIDA" || statusAtual === "CANCELADA") && (
            <div className="space-y-2">
              <Label>
                {statusAtual === "RESOLVIDA"
                  ? "Resolução"
                  : "Motivo do cancelamento"}
              </Label>
              <textarea
                className="flex min-h-[60px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                rows={2}
                {...register("resolucao")}
                placeholder={
                  statusAtual === "RESOLVIDA"
                    ? "Descreva como a pendência foi resolvida..."
                    : "Descreva o motivo do cancelamento..."
                }
              />
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
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
