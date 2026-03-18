import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  MapPin,
  Pencil,
  Trash2,
  User,
} from "lucide-react";
import { tipoEventoOptions } from "@/modules/shared/constants";
import { formatDateTimeBR, formatRelativeDate } from "@/modules/shared/lib/date";
import { cn } from "@/modules/shared/lib/utils";
import type { EventoAgenda, EventoOrigem, TipoEvento } from "@/modules/shared/types";
import { Button } from "@/modules/shared/ui/button";

const typeBadgeClass: Record<TipoEvento, string> = {
  REUNIAO: "bg-sky-100 text-sky-700",
  PRESTACAO_CONTAS: "bg-amber-100 text-amber-700",
  ENTREGA_DOCUMENTOS: "bg-emerald-100 text-emerald-700",
  VENCIMENTO_ETAPA: "bg-rose-100 text-rose-700",
  OUTROS: "bg-slate-100 text-slate-700",
};

const originLabel: Record<EventoOrigem, string> = {
  MANUAL: "Manual",
  PENDENCIA: "Pendência",
};

const originBadgeClass: Record<EventoOrigem, string> = {
  MANUAL: "bg-slate-900 text-white",
  PENDENCIA: "bg-violet-100 text-violet-700",
};

const getEventSummary = (evento: EventoAgenda) => {
  if (evento.origem === "PENDENCIA") {
    return evento.pendencia?.descricao ?? evento.descricao ?? "Pendência vinculada";
  }
  return evento.descricao ?? "Sem descrição adicional.";
};

type Props = {
  evento: EventoAgenda;
  expanded: boolean;
  onToggleExpand: (id: string) => void;
  onEdit: (evento: EventoAgenda) => void;
  onDelete: (evento: EventoAgenda) => void;
  canEdit: boolean;
  canDelete: boolean;
};

export function EventoCard({
  evento,
  expanded,
  onToggleExpand,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: Props) {
  const manualEvent = evento.origem === "MANUAL";
  const canDeleteEvent = manualEvent && canDelete;
  const summary = getEventSummary(evento);

  return (
    <article
      className={cn(
        "rounded-3xl border border-white/60 bg-white/90 p-4 shadow-sm transition",
        evento.concluidoEm && "border-emerald-200 bg-emerald-50/70"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                typeBadgeClass[evento.tipo]
              )}
            >
              {tipoEventoOptions.find(
                (option) => option.value === evento.tipo
              )?.label ?? "Evento"}
            </span>
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                originBadgeClass[evento.origem]
              )}
            >
              {originLabel[evento.origem]}
            </span>
            {evento.concluidoEm && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Concluído
              </span>
            )}
          </div>

          <div>
            <h4 className="text-base font-semibold text-slate-900">
              {evento.titulo}
            </h4>
            <p className="mt-1 text-sm text-slate-600">{summary}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onToggleExpand(evento.id)}
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
        >
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-slate-400" />
          <span>{formatDateTimeBR(evento.dataInicio)}</span>
          <span className="text-slate-400">
            ({formatRelativeDate(evento.dataInicio)})
          </span>
        </div>
        {evento.local && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400" />
            <span>{evento.local}</span>
          </div>
        )}
        {evento.responsavel && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-slate-400" />
            <span>{evento.responsavel}</span>
          </div>
        )}
      </div>

      {expanded && (
        <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
          {evento.convenio && (
            <div className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
              Convênio:{" "}
              <strong className="text-slate-900">
                {evento.convenio.codigo} · {evento.convenio.titulo}
              </strong>
            </div>
          )}

          {evento.descricaoComplementar && (
            <div className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
              Observações adicionais:{" "}
              <strong className="text-slate-900">
                {evento.descricaoComplementar}
              </strong>
            </div>
          )}

          {evento.origem === "PENDENCIA" && evento.pendencia && (
            <div className="rounded-2xl bg-violet-50 px-3 py-2 text-sm text-violet-700">
              Evento sincronizado automaticamente com a pendência do convênio.
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {canEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(evento)}
              >
                <Pencil className="h-4 w-4" />
                {evento.origem === "MANUAL"
                  ? "Editar evento"
                  : "Editar observações"}
              </Button>
            )}
            {canDeleteEvent && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(evento)}
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
