import { Edit, FileBarChart2 } from "lucide-react";
import { StatusBadge } from "@/modules/shared/components/StatusBadge";
import type { Convenio } from "@/modules/shared/types";
import { formatCurrency, formatDate } from "@/modules/shared/utils/format";

type ConveniosListTableProps = {
  convenios: Convenio[];
  onOpenDetails: (id: string) => void;
  onOpenSummary: (convenio: { id: string; titulo: string }) => void;
};

export function ConveniosListTable({
  convenios,
  onOpenDetails,
  onOpenSummary
}: ConveniosListTableProps) {
  return (
    <div className="relative overflow-x-auto rounded-3xl border border-slate-100">
      <table className="min-w-full divide-y divide-slate-100 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Convênio</th>
            <th className="px-4 py-3">Secretaria</th>
            <th className="px-4 py-3">Valor</th>
            <th className="px-4 py-3">Vigência</th>
            <th className="px-4 py-3 text-center">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 bg-white/70">
          {convenios.map((convenio) => (
            <tr key={convenio.id} className="hover:bg-slate-50/70">
              <td className="px-4 py-4">
                <p className="font-semibold text-slate-900">{convenio.titulo}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                  {convenio.codigo}
                  <StatusBadge status={convenio.status} />
                </div>
              </td>
              <td className="px-4 py-4 text-slate-600">{convenio.secretaria?.nome ?? "—"}</td>
              <td className="px-4 py-4 font-semibold text-slate-900">
                {formatCurrency(convenio.valorGlobal)}
              </td>
              <td className="px-4 py-4 text-slate-500">
                {formatDate(convenio.dataInicioVigencia)} <br />
                <span className="text-xs text-slate-400">até {formatDate(convenio.dataFimVigencia)}</span>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onOpenDetails(convenio.id)}
                    className="inline-flex items-center gap-1 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                    title="Ver detalhes"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Detalhes
                  </button>
                  <button
                    onClick={() => onOpenSummary({ id: convenio.id, titulo: convenio.titulo })}
                    className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-100"
                    title="Ver resumo"
                  >
                    <FileBarChart2 className="h-3.5 w-3.5" />
                    Resumo
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {convenios.length === 0 && (
        <p className="p-6 text-center text-sm text-slate-400">
          Nenhum convênio encontrado com os filtros atuais.
        </p>
      )}
    </div>
  );
}
