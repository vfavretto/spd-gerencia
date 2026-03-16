import { zodResolver } from "@hookform/resolvers/zod";
import { MailPlus, Pencil } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { tipoComunicadoOptions } from "@/modules/shared/constants";
import { toStringDateInputValue } from "@/modules/shared/lib/date";
import type { Comunicado } from "@/modules/shared/types";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from "@/modules/shared/ui";

const comunicadoSchema = z.object({
  protocolo: z.string().min(3, "Informe o número do protocolo"),
  assunto: z.string().min(3, "Assunto obrigatório"),
  conteudo: z.string().optional(),
  tipo: z.enum(["ENTRADA", "SAIDA"]),
  dataRegistro: z.string().optional(),
  origem: z.string().optional(),
  destino: z.string().optional(),
  responsavel: z.string().optional(),
  arquivoUrl: z.string().optional(),
});

export type ComunicadoFormData = z.infer<typeof comunicadoSchema>;
type FormMode = "create" | "edit";

const getFormValues = (comunicado?: Comunicado | null): ComunicadoFormData => ({
  protocolo: comunicado?.protocolo ?? "",
  assunto: comunicado?.assunto ?? "",
  conteudo: comunicado?.conteudo ?? "",
  tipo: comunicado?.tipo ?? "ENTRADA",
  dataRegistro: toStringDateInputValue(comunicado?.dataRegistro),
  origem: comunicado?.origem ?? "",
  destino: comunicado?.destino ?? "",
  responsavel: comunicado?.responsavel ?? "",
  arquivoUrl: comunicado?.arquivoUrl ?? "",
});

type Props = {
  isOpen: boolean;
  formMode: FormMode;
  editingComunicado: Comunicado | null;
  isSubmitting: boolean;
  hasError: boolean;
  onClose: () => void;
  onSubmit: (data: ComunicadoFormData) => void;
};

export function ComunicadoFormDialog({
  isOpen,
  formMode,
  editingComunicado,
  isSubmitting,
  hasError,
  onClose,
  onSubmit,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    resetField,
    watch,
    formState: { errors },
  } = useForm<ComunicadoFormData>({
    resolver: zodResolver(comunicadoSchema),
    defaultValues: getFormValues(),
  });

  const tipoSelecionado = watch("tipo");

  useEffect(() => {
    if (!isOpen) {
      reset(getFormValues());
      return;
    }

    reset(getFormValues(editingComunicado));
  }, [editingComunicado, isOpen, reset]);

  useEffect(() => {
    if (!isOpen) return;

    if (tipoSelecionado === "ENTRADA") {
      resetField("destino");
      return;
    }

    resetField("origem");
  }, [isOpen, resetField, tipoSelecionado]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          return;
        }
      }}
    >
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-[32px] border border-slate-200 bg-white p-0 shadow-2xl sm:max-w-4xl">
        <DialogHeader className="border-b border-slate-100 px-6 py-5">
          <DialogTitle className="flex items-center gap-3 text-xl text-slate-900">
            <span className="rounded-2xl bg-primary-50 p-2.5 text-primary-600">
              {formMode === "create" ? (
                <MailPlus className="h-5 w-5" />
              ) : (
                <Pencil className="h-5 w-5" />
              )}
            </span>
            {formMode === "create" ? "Registrar comunicado" : "Editar comunicado"}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            {formMode === "create"
              ? "Cadastre o protocolo com os campos ja usados pelo sistema."
              : "Atualize os dados do comunicado selecionado sem perder o contexto do historico."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-6 px-6 py-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="protocolo">Protocolo</Label>
                  <Input
                    id="protocolo"
                    {...register("protocolo")}
                    placeholder="Ex: COM-001/2026"
                  />
                  {errors.protocolo && (
                    <p className="mt-1 text-xs text-rose-500">
                      {errors.protocolo.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Tipo</Label>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    {tipoComunicadoOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`cursor-pointer rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                          tipoSelecionado === option.value
                            ? option.value === "ENTRADA"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-amber-200 bg-amber-50 text-amber-700"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                        }`}
                      >
                        <input
                          type="radio"
                          value={option.value}
                          className="sr-only"
                          {...register("tipo")}
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="assunto">Assunto</Label>
                <Input
                  id="assunto"
                  {...register("assunto")}
                  placeholder="Resumo do comunicado"
                />
                {errors.assunto && (
                  <p className="mt-1 text-xs text-rose-500">{errors.assunto.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="conteudo">Conteudo</Label>
                <textarea
                  id="conteudo"
                  rows={6}
                  className="mt-1 flex w-full rounded-[24px] border border-slate-200 bg-white/60 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  {...register("conteudo")}
                  placeholder="Detalhes, contexto e encaminhamentos"
                />
              </div>
            </div>

            <div className="space-y-4 rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Metadados
                </p>
                <h4 className="mt-2 text-lg font-semibold text-slate-900">
                  Contexto do registro
                </h4>
                <p className="mt-1 text-sm text-slate-500">
                  Campos auxiliares para localizar, atribuir e vincular o documento.
                </p>
              </div>

              <div>
                <Label htmlFor="dataRegistro">Data do registro</Label>
                <Input id="dataRegistro" type="date" {...register("dataRegistro")} />
              </div>

              {tipoSelecionado === "ENTRADA" ? (
                <div>
                  <Label htmlFor="origem">Origem</Label>
                  <Input
                    id="origem"
                    {...register("origem")}
                    placeholder="Secretaria ou orgao remetente"
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="destino">Destinatario</Label>
                  <Input
                    id="destino"
                    {...register("destino")}
                    placeholder="Setor ou responsavel destinatario"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="responsavel">Responsavel</Label>
                <Input
                  id="responsavel"
                  {...register("responsavel")}
                  placeholder="Nome do servidor"
                />
              </div>

              <div>
                <Label htmlFor="arquivoUrl">Link do arquivo</Label>
                <Input
                  id="arquivoUrl"
                  {...register("arquivoUrl")}
                  placeholder="https://"
                />
              </div>
            </div>
          </div>

          {hasError && (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              Não foi possível salvar o comunicado. Verifique os dados e tente novamente.
            </p>
          )}

          <DialogFooter className="gap-2 border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? formMode === "create"
                  ? "Registrando..."
                  : "Salvando..."
                : formMode === "create"
                  ? "Registrar comunicado"
                  : "Salvar alteracoes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
