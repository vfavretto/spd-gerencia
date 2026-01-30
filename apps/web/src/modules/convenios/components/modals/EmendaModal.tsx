import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Landmark, Plus, Pencil } from "lucide-react";
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
import { CurrencyInput } from "@/modules/shared/ui/currency-input";
import { emendaService } from "@/modules/convenios/services/emendaService";
import { toast } from "@/modules/shared/ui/toaster";
import type { EmendaParlamentar } from "@/modules/shared/types";
import { useEffect } from "react";

const schema = z.object({
  nomeParlamentar: z.string().min(2, "Nome do parlamentar é obrigatório"),
  partido: z.string().optional(),
  codigoEmenda: z.string().optional(),
  funcao: z.string().optional(),
  subfuncao: z.string().optional(),
  programa: z.string().optional(),
  valorIndicado: z.number().optional(),
  anoEmenda: z.number().int().min(2000).max(2100).optional()
});

type FormData = z.infer<typeof schema>;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  convenioId: string;
  emenda?: EmendaParlamentar | null;
  onSuccess: () => void;
};

export function EmendaModal({
  isOpen,
  onClose,
  convenioId,
  emenda,
  onSuccess
}: Props) {
  const queryClient = useQueryClient();
  const isEditing = !!emenda;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nomeParlamentar: "",
      partido: '',
      codigoEmenda: '',
      funcao: '',
      subfuncao: '',
      programa: '',
      valorIndicado: undefined,
      anoEmenda: new Date().getFullYear()
    }
  });

  // Preencher formulário ao editar
  useEffect(() => {
    if (emenda) {
      reset({
        nomeParlamentar: emenda.nomeParlamentar,
        partido: emenda.partido || '',
        codigoEmenda: emenda.codigoEmenda || '',
        funcao: emenda.funcao || '',
        subfuncao: emenda.subfuncao || '',
        programa: emenda.programa || '',
        valorIndicado: emenda.valorIndicado ? Number(emenda.valorIndicado) : undefined,
        anoEmenda: emenda.anoEmenda || new Date().getFullYear()
      });
    } else {
      reset({
        nomeParlamentar: '',
        partido: '',
        codigoEmenda: '',
        funcao: '',
        subfuncao: '',
        programa: "",
        valorIndicado: undefined,
        anoEmenda: new Date().getFullYear()
      });
    }
  }, [emenda, reset]);

  const createMutation = useMutation({
    mutationFn: (data: FormData) => emendaService.create(convenioId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["convenio", String(convenioId)] });
      queryClient.invalidateQueries({ queryKey: ["emendas", String(convenioId)] });
      toast.success("Emenda parlamentar cadastrada com sucesso!");
      reset();
      onClose();
      onSuccess();
    },
    onError: () => {
      toast.error("Erro ao cadastrar emenda parlamentar");
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => emendaService.update(convenioId, emenda!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["convenio", String(convenioId)] });
      queryClient.invalidateQueries({ queryKey: ["emendas", String(convenioId)] });
      toast.success("Emenda parlamentar atualizada com sucesso!");
      reset();
      onClose();
      onSuccess();
    },
    onError: () => {
      toast.error("Erro ao atualizar emenda parlamentar");
    }
  });

  const onSubmit = (data: FormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5" />
            {isEditing ? "Editar Emenda Parlamentar" : "Nova Emenda Parlamentar"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações da emenda parlamentar"
              : "Cadastre uma nova emenda parlamentar vinculada a este convênio"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nome do Parlamentar */}
          <div className="space-y-2">
            <Label htmlFor="nomeParlamentar">Nome do Parlamentar *</Label>
            <Input
              id="nomeParlamentar"
              placeholder="Ex: João da Silva"
              {...register("nomeParlamentar")}
            />
            {errors.nomeParlamentar && (
              <p className="text-xs text-destructive">{errors.nomeParlamentar.message}</p>
            )}
          </div>

          {/* Partido e Ano */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="partido">Partido</Label>
              <Input
                id="partido"
                placeholder="Ex: PT, PSDB, MDB..."
                {...register("partido")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="anoEmenda">Ano da Emenda</Label>
              <Input
                id="anoEmenda"
                type="number"
                min={2000}
                max={2100}
                {...register("anoEmenda", { valueAsNumber: true })}
              />
              {errors.anoEmenda && (
                <p className="text-xs text-destructive">{errors.anoEmenda.message}</p>
              )}
            </div>
          </div>

          {/* Código da Emenda */}
          <div className="space-y-2">
            <Label htmlFor="codigoEmenda">Código da Emenda</Label>
            <Input
              id="codigoEmenda"
              placeholder="Ex: 123456789-0"
              {...register("codigoEmenda")}
            />
          </div>

          {/* Valor Indicado */}
          <div className="space-y-2">
            <Label>Valor Indicado</Label>
            <CurrencyInput
              value={watch("valorIndicado")}
              onValueChange={(value) => setValue("valorIndicado", value ?? undefined)}
              placeholder="R$ 0,00"
            />
          </div>

          {/* Função e Subfunção */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="funcao">Função</Label>
              <Input
                id="funcao"
                placeholder="Ex: Saúde, Educação..."
                {...register("funcao")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subfuncao">Subfunção</Label>
              <Input
                id="subfuncao"
                placeholder="Ex: Atenção Básica..."
                {...register("subfuncao")}
              />
            </div>
          </div>

          {/* Programa */}
          <div className="space-y-2">
            <Label htmlFor="programa">Programa</Label>
            <Input
              id="programa"
              placeholder="Nome do programa"
              {...register("programa")}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                "Salvando..."
              ) : isEditing ? (
                <>
                  <Pencil className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Emenda
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
