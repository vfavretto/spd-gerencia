import { Filter, Search, X } from "lucide-react";
import type { ComunicadoFilters } from "@/modules/comunicados/services/comunicadoService";
import { tipoComunicadoOptions } from "@/modules/shared/constants";
import {
  Button,
  Input,
  Label,
} from "@/modules/shared/ui";

type Props = {
  filters: ComunicadoFilters;
  onFilterChange: (newFilters: Partial<ComunicadoFilters>) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
};

export function ComunicadoFilters({
  filters,
  onFilterChange,
  onClear,
  hasActiveFilters,
}: Props) {
  return (
    <>
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Historico
          </p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">
            Comunicados cadastrados
          </h3>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,0.8fr))]">
          <div className="lg:min-w-[280px]">
            <Label
              htmlFor="comunicados-search"
              className="flex items-center gap-2 text-slate-600"
            >
              <Search className="h-4 w-4" />
              Buscar
            </Label>
            <Input
              id="comunicados-search"
              placeholder="Protocolo, assunto, origem ou destino"
              value={filters.search || ""}
              onChange={(event) => onFilterChange({ search: event.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="comunicados-responsavel" className="text-slate-600">
              Responsavel
            </Label>
            <Input
              id="comunicados-responsavel"
              placeholder="Nome"
              value={filters.responsavel || ""}
              onChange={(event) =>
                onFilterChange({ responsavel: event.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="comunicados-data-inicio" className="text-slate-600">
              Data inicio
            </Label>
            <Input
              id="comunicados-data-inicio"
              type="date"
              value={filters.dataInicio || ""}
              onChange={(event) =>
                onFilterChange({ dataInicio: event.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="comunicados-data-fim" className="text-slate-600">
              Data fim
            </Label>
            <Input
              id="comunicados-data-fim"
              type="date"
              value={filters.dataFim || ""}
              onChange={(event) =>
                onFilterChange({ dataFim: event.target.value })
              }
            />
          </div>

          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onClear}
              disabled={!hasActiveFilters}
            >
              <X className="h-4 w-4" />
              Limpar
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          <Filter className="h-3.5 w-3.5" />
          Tipo
        </span>
        <button
          type="button"
          onClick={() => onFilterChange({ tipo: "" })}
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
            !filters.tipo
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
          }`}
        >
          Todos
        </button>
        {tipoComunicadoOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onFilterChange({ tipo: option.value })}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              filters.tipo === option.value
                ? option.value === "ENTRADA"
                  ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                  : "border-amber-200 bg-amber-100 text-amber-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </>
  );
}
