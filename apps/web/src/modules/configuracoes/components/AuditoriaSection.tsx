import { useQuery } from "@tanstack/react-query";
import { ScrollText } from "lucide-react";
import { useState } from "react";
import { auditoriaService } from "@/modules/configuracoes/services/auditoriaService";
import { formatDate } from "@/modules/shared/lib/format";

export function AuditoriaSection() {
  const [filters, setFilters] = useState({
    acao: "",
    entidade: "",
    dataInicio: "",
    dataFim: ""
  });
  const [page, setPage] = useState(1);

  const logsQuery = useQuery({
    queryKey: ["auditoria", filters, page],
    queryFn: () =>
      auditoriaService.list({
        acao: filters.acao || undefined,
        entidade: filters.entidade || undefined,
        dataInicio: filters.dataInicio || undefined,
        dataFim: filters.dataFim || undefined,
        page,
        limit: 15
      })
  });

  const result = logsQuery.data;
  const logs = result?.data ?? [];

  const acaoBadge: Record<string, string> = {
    CREATE: "bg-emerald-100 text-emerald-700",
    UPDATE: "bg-blue-100 text-blue-700",
    DELETE: "bg-rose-100 text-rose-700"
  };

  const acaoLabel: Record<string, string> = {
    CREATE: "Criação",
    UPDATE: "Atualização",
    DELETE: "Exclusão"
  };

  return (
    <section className="glass-panel flex flex-col gap-4 p-6">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
          <ScrollText className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Logs de auditoria</h3>
          <p className="text-sm text-slate-500">Acompanhe todas as ações realizadas no sistema.</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div>
          <label className="form-label">Ação</label>
          <select
            className="form-input"
            value={filters.acao}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, acao: e.target.value }));
              setPage(1);
            }}
          >
            <option value="">Todas</option>
            <option value="CREATE">Criação</option>
            <option value="UPDATE">Atualização</option>
            <option value="DELETE">Exclusão</option>
          </select>
        </div>
        <div>
          <label className="form-label">Entidade</label>
          <select
            className="form-input"
            value={filters.entidade}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, entidade: e.target.value }));
              setPage(1);
            }}
          >
            <option value="">Todas</option>
            <option value="Convenio">Convênio</option>
            <option value="Comunicado">Comunicado</option>
            <option value="EventoAgenda">Evento</option>
            <option value="ContratoExecucao">Contrato</option>
            <option value="Pendencia">Pendência</option>
          </select>
        </div>
        <div>
          <label className="form-label">De</label>
          <input
            type="date"
            className="form-input"
            value={filters.dataInicio}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, dataInicio: e.target.value }));
              setPage(1);
            }}
          />
        </div>
        <div>
          <label className="form-label">Até</label>
          <input
            type="date"
            className="form-input"
            value={filters.dataFim}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, dataFim: e.target.value }));
              setPage(1);
            }}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-slate-100">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Usuário</th>
              <th className="px-4 py-3">Ação</th>
              <th className="px-4 py-3">Entidade</th>
              <th className="px-4 py-3">ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 bg-white/80">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {formatDate(log.criadoEm)}
                </td>
                <td className="px-4 py-3 text-slate-700">{log.usuarioNome}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${acaoBadge[log.acao] ?? "bg-slate-100 text-slate-600"}`}
                  >
                    {acaoLabel[log.acao] ?? log.acao}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-700">{log.entidade}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">
                  {log.entidadeId.slice(0, 8)}...
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <p className="p-6 text-center text-sm text-slate-400">
            Nenhum registro de auditoria encontrado.
          </p>
        )}
      </div>

      {result && result.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>
            Página {result.page} de {result.totalPages} ({result.total} registros)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-semibold transition hover:bg-slate-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page >= result.totalPages}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-semibold transition hover:bg-slate-50 disabled:opacity-50"
            >
              Próximo
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
