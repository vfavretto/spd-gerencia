import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Circle, Clock, X } from "lucide-react";
import { convenioService } from "@/modules/convenios/services/convenioService";
import { formatDate } from "@/modules/shared/utils/format";

type Props = {
  convenioId: string;
  convenioTitulo: string;
  onClose: () => void;
};

export const EtapasResumoModal = ({ convenioId, convenioTitulo, onClose }: Props) => {
  const { data: convenio, isLoading } = useQuery({
    queryKey: ["convenio-etapas", convenioId],
    queryFn: () => convenioService.getById(convenioId)
  });

  const etapas = convenio?.etapas ?? [];
  const concluidas = etapas.filter((e) => e.dataRealizada).length;
  const atrasadas = etapas.filter(
    (e) => !e.dataRealizada && e.dataPrevista && new Date(e.dataPrevista) < new Date()
  ).length;
  const pendentes = etapas.length - concluidas - atrasadas;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Etapas do convênio</h2>
            <p className="mt-0.5 text-sm text-slate-500 line-clamp-1">{convenioTitulo}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-sm text-slate-400">Carregando etapas...</div>
        ) : etapas.length === 0 ? (
          <div className="py-12 text-center">
            <Circle className="mx-auto h-10 w-10 text-slate-200" />
            <p className="mt-3 text-sm text-slate-400">Nenhuma etapa cadastrada para este convênio.</p>
          </div>
        ) : (
          <>
            {/* Resumo */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-emerald-50 p-3 text-center">
                <p className="font-mono text-xl font-bold text-emerald-600">{concluidas}</p>
                <p className="text-xs text-emerald-600">Concluídas</p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-3 text-center">
                <p className="font-mono text-xl font-bold text-amber-600">{pendentes}</p>
                <p className="text-xs text-amber-600">Pendentes</p>
              </div>
              <div className="rounded-2xl bg-rose-50 p-3 text-center">
                <p className="font-mono text-xl font-bold text-rose-600">{atrasadas}</p>
                <p className="text-xs text-rose-600">Atrasadas</p>
              </div>
            </div>

            {/* Barra de progresso */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{concluidas} de {etapas.length} etapas concluídas</span>
                <span>{etapas.length > 0 ? Math.round((concluidas / etapas.length) * 100) : 0}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-all"
                  style={{ width: `${etapas.length > 0 ? (concluidas / etapas.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Lista de etapas */}
            <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
              {etapas.map((etapa) => {
                const isConcluida = Boolean(etapa.dataRealizada);
                const isAtrasada = !isConcluida && etapa.dataPrevista && new Date(etapa.dataPrevista) < new Date();

                return (
                  <div
                    key={etapa.id}
                    className={`flex items-start gap-3 rounded-2xl border p-3 transition ${
                      isConcluida
                        ? "border-emerald-100 bg-emerald-50/50"
                        : isAtrasada
                          ? "border-rose-100 bg-rose-50/50"
                          : "border-slate-100 bg-white"
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {isConcluida ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : isAtrasada ? (
                        <Clock className="h-5 w-5 text-rose-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium ${isConcluida ? "text-emerald-700 line-through" : "text-slate-800"}`}>
                        {etapa.titulo}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
                        {etapa.dataPrevista && (
                          <span>Prevista: {formatDate(etapa.dataPrevista)}</span>
                        )}
                        {etapa.dataRealizada && (
                          <span className="text-emerald-600">Realizada: {formatDate(etapa.dataRealizada)}</span>
                        )}
                        {etapa.responsavel && (
                          <span>Resp: {etapa.responsavel}</span>
                        )}
                      </div>
                      {etapa.situacao && (
                        <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                          {etapa.situacao}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
