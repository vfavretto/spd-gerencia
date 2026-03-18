import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  Link2,
  Pencil,
  Trash2,
  UserRound,
} from "lucide-react";
import type { Comunicado } from "@/modules/shared/types";
import { formatDate } from "@/modules/shared/lib/format";
import {
  Badge,
  Button,
  Card,
  CardContent,
} from "@/modules/shared/ui";

type SummaryCardProps = {
  label: string;
  value: string | number;
  helper: string;
  icon: LucideIcon;
  tone: string;
};

export const SummaryCard = ({
  label,
  value,
  helper,
  icon: Icon,
  tone,
}: SummaryCardProps) => (
  <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md">
    <CardContent className="flex items-center justify-between gap-4 p-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <strong className="text-2xl font-semibold tracking-tight text-slate-900">
            {value}
          </strong>
          <span className="truncate text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
            {helper}
          </span>
        </div>
      </div>
      <span className={`rounded-2xl p-3 ${tone}`}>
        <Icon className="h-5 w-5" />
      </span>
    </CardContent>
  </Card>
);

const getTipoClasses = (tipo: Comunicado["tipo"]) =>
  tipo === "ENTRADA"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-amber-200 bg-amber-50 text-amber-700";

type ComunicadoCardProps = {
  comunicado: Comunicado;
  onOpenPanel: (comunicado: Comunicado) => void;
  onEdit: (comunicado: Comunicado) => void;
  onDelete: (comunicado: Comunicado) => void;
  canUpdate: boolean;
  canDelete: boolean;
};

export function ComunicadoCard({
  comunicado,
  onOpenPanel,
  onEdit,
  onDelete,
  canUpdate,
  canDelete,
}: ComunicadoCardProps) {
  const isEntrada = comunicado.tipo === "ENTRADA";

  return (
    <Card className="overflow-hidden border-slate-200 bg-white transition duration-300 hover:border-primary-200 hover:shadow-lg">
      <div
        className={`h-1.5 w-full ${
          isEntrada ? "bg-emerald-400" : "bg-amber-400"
        }`}
      />
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              {comunicado.protocolo}
            </p>
            <h4 className="text-lg font-semibold leading-tight text-slate-900">
              {comunicado.assunto}
            </h4>
          </div>
          <Badge className={`border ${getTipoClasses(comunicado.tipo)}`}>
            {comunicado.tipo === "ENTRADA" ? "Entrada" : "Saida"}
          </Badge>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-slate-500">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(comunicado.dataRegistro)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
            <UserRound className="h-3.5 w-3.5" />
            {comunicado.responsavel?.trim() || "Sem responsavel"}
          </span>
          {comunicado.arquivoUrl && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-primary-700">
              <Link2 className="h-3.5 w-3.5" />
              Com anexo
            </span>
          )}
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-600">
          {comunicado.conteudo?.trim() || "Sem conteudo complementar informado."}
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Origem
            </p>
            <p className="mt-2 text-sm font-medium text-slate-700">
              {comunicado.origem?.trim() || "Nao informada"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Destinatario
            </p>
            <p className="mt-2 text-sm font-medium text-slate-700">
              {comunicado.destino?.trim() || "Nao informado"}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <span className="text-sm font-medium text-slate-500">
            Revise o registro ou abra os detalhes completos
          </span>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label={`Abrir detalhes de ${comunicado.assunto}`}
              onClick={() => onOpenPanel(comunicado)}
            >
              Abrir painel
            </Button>
            {canUpdate && (
              <Button
                type="button"
                variant="ghost"
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
      </CardContent>
    </Card>
  );
}
