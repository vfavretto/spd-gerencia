import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { convenioService } from "@/modules/convenios/services/convenioService";
import { configService } from "@/modules/configuracoes/services/configService";
import { toast } from "@/modules/shared/ui/toaster";

const schema = z.object({
  numeroTermo: z.string().min(1, "Informe o número do termo"),
  dataAssinatura: z.string().min(1, "Informe a data de assinatura"),
  dataInicioVigencia: z.string().min(1, "Informe o início da vigência"),
  dataFimVigencia: z.string().min(1, "Informe o fim da vigência"),
  tipoTermoFormalizacaoId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  convenioId: string;
  onSuccess: () => void;
};

export function RegistrarAssinaturaModal({
  isOpen,
  onClose,
  convenioId,
  onSuccess,
}: Props) {
  const queryClient = useQueryClient();

  const tiposTermoQuery = useQuery({
    queryKey: ["tiposTermoFormalizacao"],
    queryFn: () => configService.listTiposTermoFormalizacao(),
    enabled: isOpen,
  });

  const tiposTermo = tiposTermoQuery.data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload: Record<string, unknown> = {
        ...data,
        status: "APROVADO",
      };
      // Enviar tipoTermoFormalizacaoId apenas se selecionado
      if (!data.tipoTermoFormalizacaoId) {
        delete payload.tipoTermoFormalizacaoId;
      }
      return convenioService.update(convenioId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["convenio", String(convenioId)],
      });
      toast.success("Assinatura registrada com sucesso!");
      reset();
      onClose();
      onSuccess();
    },
    onError: () => {
      toast.error("Erro ao registrar assinatura");
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Assinatura</DialogTitle>
          <DialogDescription>
            Informe os dados da assinatura do convênio
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="numeroTermo">Número do Termo *</Label>
            <Input
              id="numeroTermo"
              {...register("numeroTermo")}
              placeholder="Ex: TC 001/2025"
            />
            {errors.numeroTermo && (
              <p className="text-xs text-destructive">
                {errors.numeroTermo.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipoTermoFormalizacaoId">
              Tipo de Termo de Formalização
            </Label>
            <select
              id="tipoTermoFormalizacaoId"
              {...register("tipoTermoFormalizacaoId")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Selecione um tipo...</option>
              {tiposTermo.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataAssinatura">Data de Assinatura *</Label>
            <Input
              type="date"
              id="dataAssinatura"
              {...register("dataAssinatura")}
            />
            {errors.dataAssinatura && (
              <p className="text-xs text-destructive">
                {errors.dataAssinatura.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dataInicioVigencia">Início da Vigência *</Label>
              <Input
                type="date"
                id="dataInicioVigencia"
                {...register("dataInicioVigencia")}
              />
              {errors.dataInicioVigencia && (
                <p className="text-xs text-destructive">
                  {errors.dataInicioVigencia.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataFimVigencia">Fim da Vigência *</Label>
              <Input
                type="date"
                id="dataFimVigencia"
                {...register("dataFimVigencia")}
              />
              {errors.dataFimVigencia && (
                <p className="text-xs text-destructive">
                  {errors.dataFimVigencia.message}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
            <strong>Atenção:</strong> Ao registrar a assinatura, o status do
            convênio será alterado para "Aprovado".
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
                  <CalendarCheck className="h-4 w-4 mr-2" />
                  Registrar
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
