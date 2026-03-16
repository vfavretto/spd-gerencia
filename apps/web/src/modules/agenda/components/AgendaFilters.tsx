import { Filter, Search } from "lucide-react";
import { tipoEventoOptions } from "@/modules/shared/constants";
import { cn } from "@/modules/shared/lib/utils";
import type { EventoOrigem, TipoEvento, Convenio } from "@/modules/shared/types";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  selectedTipo: "TODOS" | TipoEvento;
  onTipoChange: (value: "TODOS" | TipoEvento) => void;
  selectedOrigem: "TODOS" | EventoOrigem;
  onOrigemChange: (value: "TODOS" | EventoOrigem) => void;
  selectedConvenioId: string;
  onConvenioIdChange: (value: string) => void;
  showConcluidos: boolean;
  onToggleConcluidos: () => void;
  totalConcluidos: number;
  filteredCount: number;
  convenios: Convenio[];
};

export function AgendaFilters({
  search,
  onSearchChange,
  selectedTipo,
  onTipoChange,
  selectedOrigem,
  onOrigemChange,
  selectedConvenioId,
  onConvenioIdChange,
  showConcluidos,
  onToggleConcluidos,
  totalConcluidos,
  filteredCount,
  convenios,
}: Props) {
  return (
    <section className="glass-panel p-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Buscar por título, convênio, responsável ou pendência"
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            <Filter className="h-4 w-4" />
            {filteredCount} evento(s) visível(is)
          </div>

          <button
            type="button"
            onClick={onToggleConcluidos}
            className={cn(
              "rounded-2xl border px-4 py-3 text-sm font-medium transition",
              showConcluidos
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            )}
          >
            {showConcluidos
              ? `Ocultar concluídos (${totalConcluidos})`
              : `Mostrar concluídos (${totalConcluidos})`}
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
          <select
            className="form-input"
            value={selectedTipo}
            onChange={(event) =>
              onTipoChange(event.target.value as "TODOS" | TipoEvento)
            }
          >
            <option value="TODOS">Todos os tipos</option>
            {tipoEventoOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            className="form-input"
            value={selectedOrigem}
            onChange={(event) =>
              onOrigemChange(
                event.target.value as "TODOS" | EventoOrigem
              )
            }
          >
            <option value="TODOS">Todas as origens</option>
            <option value="MANUAL">Somente manuais</option>
            <option value="PENDENCIA">Somente pendências</option>
          </select>

          <select
            className="form-input md:col-span-2"
            value={selectedConvenioId}
            onChange={(event) => onConvenioIdChange(event.target.value)}
          >
            <option value="TODOS">Todos os convênios</option>
            {convenios.map((convenio) => (
              <option key={convenio.id} value={convenio.id}>
                {convenio.codigo} · {convenio.titulo}
              </option>
            ))}
          </select>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Pendências concluídas ficam ocultas por padrão para manter foco operacional.
          </div>
        </div>
      </div>
    </section>
  );
}
