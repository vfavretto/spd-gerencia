import { useQuery } from "@tanstack/react-query";
import { History } from "lucide-react";
import { useState } from "react";
import { convenioService } from "@/modules/convenios/services/convenioService";
import { snapshotService } from "@/modules/configuracoes/services/snapshotService";
import { formatDate } from "@/modules/shared/lib/format";

export function SnapshotsSection() {
  const [selectedConvenioId, setSelectedConvenioId] = useState("");
  const [compareVersions, setCompareVersions] = useState<{
    v1: number;
    v2: number;
  } | null>(null);

  const conveniosQuery = useQuery({
    queryKey: ["convenios-lite-snapshots"],
    queryFn: () => convenioService.list()
  });

  const snapshotsQuery = useQuery({
    queryKey: ["snapshots", selectedConvenioId],
    queryFn: () => snapshotService.listByConvenio(selectedConvenioId),
    enabled: Boolean(selectedConvenioId)
  });

  const compareQuery = useQuery({
    queryKey: ["snapshot-compare", selectedConvenioId, compareVersions],
    queryFn: () =>
      snapshotService.compare(selectedConvenioId, compareVersions!.v1, compareVersions!.v2),
    enabled: Boolean(selectedConvenioId && compareVersions)
  });

  const convenios = conveniosQuery.data ?? [];
  const snapshots = snapshotsQuery.data ?? [];
  const diff = compareQuery.data;

  return (
    <section className="glass-panel flex flex-col gap-4 p-6">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
          <History className="h-5 w-5 text-violet-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Snapshots de convênios</h3>
          <p className="text-sm text-slate-500">
            Visualize versões históricas e compare alterações.
          </p>
        </div>
      </div>

      <div className="max-w-md">
        <label className="form-label">Selecionar convênio</label>
        <select
          className="form-input"
          value={selectedConvenioId}
          onChange={(e) => {
            setSelectedConvenioId(e.target.value);
            setCompareVersions(null);
          }}
        >
          <option value="">Escolha um convênio...</option>
          {convenios.map((convenio) => (
            <option key={convenio.id} value={convenio.id}>
              {convenio.codigo} - {convenio.titulo}
            </option>
          ))}
        </select>
      </div>

      {selectedConvenioId && snapshotsQuery.isLoading && (
        <p className="text-sm text-slate-400">Carregando snapshots...</p>
      )}

      {selectedConvenioId && snapshots.length === 0 && !snapshotsQuery.isLoading && (
        <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
          Nenhum snapshot encontrado para este convênio.
        </div>
      )}

      {snapshots.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-3xl border border-slate-100">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Versão</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Criado por</th>
                  <th className="px-4 py-3">Motivo</th>
                  <th className="px-4 py-3 text-center">Comparar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 bg-white/80">
                {snapshots.map((snapshot) => (
                  <tr key={snapshot.id}>
                    <td className="px-4 py-3 font-mono font-bold text-slate-800">v{snapshot.versao}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(snapshot.criadoEm)}</td>
                    <td className="px-4 py-3 text-slate-700">{snapshot.criadoPorNome ?? "Sistema"}</td>
                    <td className="px-4 py-3 text-slate-500">{snapshot.motivoSnapshot ?? "—"}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() =>
                            setCompareVersions((prev) =>
                              prev ? { ...prev, v1: snapshot.versao } : { v1: snapshot.versao, v2: snapshot.versao }
                            )
                          }
                          className={`rounded-lg px-2 py-1 text-xs font-semibold transition ${
                            compareVersions?.v1 === snapshot.versao
                              ? "bg-blue-600 text-white"
                              : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                          }`}
                        >
                          V1
                        </button>
                        <button
                          onClick={() =>
                            setCompareVersions((prev) =>
                              prev ? { ...prev, v2: snapshot.versao } : { v1: snapshot.versao, v2: snapshot.versao }
                            )
                          }
                          className={`rounded-lg px-2 py-1 text-xs font-semibold transition ${
                            compareVersions?.v2 === snapshot.versao
                              ? "bg-violet-600 text-white"
                              : "bg-violet-50 text-violet-600 hover:bg-violet-100"
                          }`}
                        >
                          V2
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {compareVersions && compareVersions.v1 !== compareVersions.v2 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-700">
                Comparando v{compareVersions.v1} → v{compareVersions.v2}
              </h4>
              {compareQuery.isLoading && (
                <p className="text-sm text-slate-400">Carregando comparação...</p>
              )}
              {diff && diff.diferencas.length === 0 && (
                <p className="text-sm text-slate-400">Nenhuma diferença encontrada entre as versões.</p>
              )}
              {diff && diff.diferencas.length > 0 && (
                <div className="overflow-x-auto rounded-3xl border border-slate-100">
                  <table className="min-w-full divide-y divide-slate-100 text-sm">
                    <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Campo</th>
                        <th className="px-4 py-3">Valor anterior</th>
                        <th className="px-4 py-3">Valor novo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 bg-white/80">
                      {diff.diferencas.map((difference, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 font-medium text-slate-800">{difference.campo}</td>
                          <td className="px-4 py-3 text-rose-600">
                            {difference.valorAnterior != null ? String(difference.valorAnterior) : "—"}
                          </td>
                          <td className="px-4 py-3 text-emerald-600">
                            {difference.valorNovo != null ? String(difference.valorNovo) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
