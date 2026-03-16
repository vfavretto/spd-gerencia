import { Filter } from "lucide-react";
import { convenioStatusOptions, esferaGovernoOptions } from "@/modules/shared/constants";
import type { Catalogs } from "@/modules/shared/types";
import type { ConvenioFilters } from "@/modules/convenios/services/convenioService";

type ConveniosListFiltersProps = {
  filters: ConvenioFilters;
  catalogs?: Catalogs;
  onChange: (filters: Partial<ConvenioFilters>) => void;
};

export function ConveniosListFilters({
  filters,
  catalogs,
  onChange
}: ConveniosListFiltersProps) {
  const secretariaOptions = catalogs?.secretarias ?? [];
  const modalidadeOptions = catalogs?.modalidadesRepasse ?? [];

  return (
    <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
      <div>
        <label className="form-label flex items-center gap-2">
          <Filter className="h-4 w-4" /> Buscar
        </label>
        <input
          className="form-input"
          placeholder="Título ou código"
          value={filters.search || ""}
          onChange={(event) => onChange({ search: event.target.value })}
        />
      </div>
      <div>
        <label className="form-label">Status</label>
        <select
          className="form-input"
          value={filters.status || ""}
          onChange={(event) =>
            onChange({
              status: (event.target.value as ConvenioFilters["status"]) || ""
            })
          }
        >
          <option value="">Todos</option>
          {convenioStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="form-label">Secretaria</label>
        <select
          className="form-input"
          value={filters.secretariaId || ""}
          onChange={(event) => onChange({ secretariaId: event.target.value })}
        >
          <option value="">Todas</option>
          {secretariaOptions.map((secretaria) => (
            <option key={secretaria.id} value={secretaria.id}>
              {secretaria.nome}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="form-label">Esfera de governo</label>
        <select
          className="form-input"
          value={filters.esfera || ""}
          onChange={(event) => onChange({ esfera: event.target.value })}
        >
          <option value="">Todas</option>
          {esferaGovernoOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="form-label">Modalidade de repasse</label>
        <select
          className="form-input"
          value={filters.modalidadeRepasseId || ""}
          onChange={(event) => onChange({ modalidadeRepasseId: event.target.value })}
        >
          <option value="">Todas</option>
          {modalidadeOptions.map((modalidade) => (
            <option key={modalidade.id} value={modalidade.id}>
              {modalidade.nome}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="form-label">Vigência - Início</label>
        <input
          type="date"
          className="form-input"
          value={filters.dataInicioVigencia || ""}
          onChange={(event) => onChange({ dataInicioVigencia: event.target.value })}
        />
      </div>
      <div>
        <label className="form-label">Vigência - Fim</label>
        <input
          type="date"
          className="form-input"
          value={filters.dataFimVigencia || ""}
          onChange={(event) => onChange({ dataFimVigencia: event.target.value })}
        />
      </div>
      <div>
        <label className="form-label">Faixa de valor (R$)</label>
        <div className="flex gap-2">
          <input
            type="number"
            className="form-input"
            placeholder="Mín"
            value={filters.valorMin || ""}
            onChange={(event) => onChange({ valorMin: event.target.value })}
          />
          <input
            type="number"
            className="form-input"
            placeholder="Máx"
            value={filters.valorMax || ""}
            onChange={(event) => onChange({ valorMax: event.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
