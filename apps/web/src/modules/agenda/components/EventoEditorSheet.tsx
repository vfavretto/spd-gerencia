import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarClock } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { tipoEventoOptions } from "@/modules/shared/constants";
import { formatDateTimeBR, toDateTimeInputValue } from "@/modules/shared/lib/date";
import type { Convenio, EventoAgenda } from "@/modules/shared/types";
import { Button } from "@/modules/shared/ui/button";
import { Input } from "@/modules/shared/ui/input";
import { Label } from "@/modules/shared/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/modules/shared/ui/sheet";

const manualEventSchema = z.object({
  titulo: z.string().optional(),
  descricao: z.string().optional(),
  descricaoComplementar: z.string().optional(),
  tipo: z
    .enum([
      "REUNIAO",
      "PRESTACAO_CONTAS",
      "ENTREGA_DOCUMENTOS",
      "VENCIMENTO_ETAPA",
      "OUTROS",
    ])
    .optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  local: z.string().optional(),
  responsavel: z.string().optional(),
  convenioId: z.string().optional(),
});

export type AgendaFormData = z.infer<typeof manualEventSchema>;
type EditorMode = "create" | "edit";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editorMode: EditorMode;
  selectedEvento: EventoAgenda | null;
  isSubmitting: boolean;
  convenios: Convenio[];
  onSubmit: (data: AgendaFormData) => void;
};

export function EventoEditorSheet({
  open,
  onOpenChange,
  editorMode,
  selectedEvento,
  isSubmitting,
  convenios,
  onSubmit,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AgendaFormData>({
    resolver: zodResolver(manualEventSchema),
    defaultValues: {
      tipo: "REUNIAO",
    },
  });

  useEffect(() => {
    if (!open) {
      reset({
        titulo: "",
        descricao: "",
        descricaoComplementar: "",
        tipo: "REUNIAO",
        dataInicio: "",
        dataFim: "",
        local: "",
        responsavel: "",
        convenioId: "",
      });
      return;
    }

    if (!selectedEvento) {
      reset({
        titulo: "",
        descricao: "",
        descricaoComplementar: "",
        tipo: "REUNIAO",
        dataInicio: "",
        dataFim: "",
        local: "",
        responsavel: "",
        convenioId: "",
      });
      return;
    }

    reset({
      titulo: selectedEvento.titulo,
      descricao: selectedEvento.descricao ?? "",
      descricaoComplementar: selectedEvento.descricaoComplementar ?? "",
      tipo: selectedEvento.tipo,
      dataInicio: toDateTimeInputValue(selectedEvento.dataInicio),
      dataFim: toDateTimeInputValue(selectedEvento.dataFim),
      local: selectedEvento.local ?? "",
      responsavel: selectedEvento.responsavel ?? "",
      convenioId: selectedEvento.convenio?.id ?? selectedEvento.convenioId ?? "",
    });
  }, [open, reset, selectedEvento]);

  const isEditingAutoEvent = selectedEvento?.origem === "PENDENCIA";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>
            {editorMode === "create"
              ? "Novo evento"
              : selectedEvento?.origem === "MANUAL"
                ? "Editar evento"
                : "Editar observações do evento"}
          </SheetTitle>
          <SheetDescription>
            {editorMode === "create"
              ? "Cadastre compromissos manuais da agenda."
              : selectedEvento?.origem === "MANUAL"
                ? "Atualize todos os campos do evento manual."
                : "Eventos gerados por pendência permitem apenas observações, local e responsável."}
          </SheetDescription>
        </SheetHeader>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {isEditingAutoEvent ? (
            <div className="space-y-5">
              <div className="rounded-3xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-800">
                <div className="font-semibold">{selectedEvento?.titulo}</div>
                <p className="mt-1">
                  {selectedEvento?.pendencia?.descricao ?? selectedEvento?.descricao}
                </p>
                <p className="mt-2 text-violet-700">
                  Data vinculada: {formatDateTimeBR(selectedEvento?.dataInicio)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricaoComplementar">
                  Observações adicionais
                </Label>
                <textarea
                  id="descricaoComplementar"
                  rows={4}
                  className="form-input min-h-[120px]"
                  {...register("descricaoComplementar")}
                  placeholder="Anotações de contexto para a equipe"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="local">Local</Label>
                  <Input
                    id="local"
                    {...register("local")}
                    placeholder="Sala, endereço ou link"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responsavel">Responsável</Label>
                  <Input
                    id="responsavel"
                    {...register("responsavel")}
                    placeholder="Responsável pelo acompanhamento"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    {...register("titulo")}
                    placeholder="Ex: Reunião com órgão concedente"
                  />
                  {errors.titulo && (
                    <p className="text-xs text-rose-500">{errors.titulo.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <select id="tipo" className="form-input" {...register("tipo")}>
                    {tipoEventoOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <textarea
                  id="descricao"
                  rows={4}
                  className="form-input min-h-[120px]"
                  {...register("descricao")}
                  placeholder="Contexto, pauta ou orientações do evento"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dataInicio">Início</Label>
                  <Input
                    id="dataInicio"
                    type="datetime-local"
                    {...register("dataInicio")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataFim">Fim</Label>
                  <Input
                    id="dataFim"
                    type="datetime-local"
                    {...register("dataFim")}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="local">Local</Label>
                  <Input
                    id="local"
                    {...register("local")}
                    placeholder="Sala, endereço ou link"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responsavel">Responsável</Label>
                  <Input
                    id="responsavel"
                    {...register("responsavel")}
                    placeholder="Quem conduz o evento"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="convenioId">Convênio relacionado</Label>
                <select id="convenioId" className="form-input" {...register("convenioId")}>
                  <option value="">Nenhum</option>
                  {convenios.map((convenio) => (
                    <option key={convenio.id} value={convenio.id}>
                      {convenio.codigo} · {convenio.titulo}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <SheetFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <CalendarClock className="h-4 w-4" />
              {isSubmitting
                ? "Salvando..."
                : editorMode === "create"
                  ? "Adicionar evento"
                  : "Salvar alterações"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
