import { Link2, Pencil, Trash2 } from "lucide-react";
import type { Comunicado } from "@/modules/shared/types";
import { formatDate } from "@/modules/shared/lib/format";
import {
  Badge,
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/modules/shared/ui";

const getTipoClasses = (tipo: Comunicado["tipo"]) =>
  tipo === "ENTRADA"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-amber-200 bg-amber-50 text-amber-700";

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
      {label}
    </p>
    <p className="mt-2 text-sm font-medium text-slate-700">
      {value?.trim() ? value : "Nao informado"}
    </p>
  </div>
);

type Props = {
  comunicado: Comunicado | null;
  onClose: () => void;
  onEdit: (comunicado: Comunicado) => void;
  onDelete: (comunicado: Comunicado) => void;
  canUpdate: boolean;
  canDelete: boolean;
};

export function ComunicadoDetailSheet({
  comunicado,
  onClose,
  onEdit,
  onDelete,
  canUpdate,
  canDelete,
}: Props) {
  return (
    <Sheet
      open={Boolean(comunicado)}
      onOpenChange={(open) => !open && onClose()}
    >
      <SheetContent
        side="right"
        className="w-full overflow-y-auto border-l border-slate-200 bg-white p-0 sm:max-w-xl"
      >
        {comunicado && (
          <>
            <SheetHeader className="border-b border-slate-100 px-6 py-5 text-left">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className={`border ${getTipoClasses(comunicado.tipo)}`}>
                    {comunicado.tipo === "ENTRADA" ? "Entrada" : "Saida"}
                  </Badge>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {comunicado.protocolo}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {canUpdate && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      aria-label={`Editar comunicado ${comunicado.assunto}`}
                      onClick={() => onEdit(comunicado)}
                    >
                      <Pencil className="h-4 w-4" />
                      Editar
                    </Button>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      aria-label={`Excluir comunicado ${comunicado.assunto}`}
                      onClick={() => onDelete(comunicado)}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-xl px-4 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </button>
                  )}
                </div>
              </div>

              <SheetTitle className="mt-3 text-2xl leading-tight text-slate-900">
                {comunicado.assunto}
              </SheetTitle>
              <SheetDescription className="text-sm leading-6 text-slate-500">
                Detalhamento completo do comunicado selecionado para consulta e manutencao.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 px-6 py-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <DetailItem
                  label="Data do registro"
                  value={formatDate(comunicado.dataRegistro)}
                />
                <DetailItem
                  label="Responsavel"
                  value={comunicado.responsavel}
                />
                <DetailItem label="Origem" value={comunicado.origem} />
                <DetailItem label="Destinatario" value={comunicado.destino} />
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Conteudo
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {comunicado.conteudo?.trim() ||
                    "Sem conteudo complementar informado para este comunicado."}
                </p>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="rounded-2xl bg-primary-50 p-2 text-primary-600">
                    <Link2 className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Documento vinculado</p>
                    <p className="text-sm text-slate-500">
                      Acesse o arquivo associado quando houver link cadastrado.
                    </p>
                  </div>
                </div>
                {comunicado.arquivoUrl ? (
                  <a
                    href={comunicado.arquivoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-500"
                  >
                    <Link2 className="h-4 w-4" />
                    Abrir anexo
                  </a>
                ) : (
                  <p className="mt-4 text-sm text-slate-500">
                    Nenhum link de arquivo foi informado para este comunicado.
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
