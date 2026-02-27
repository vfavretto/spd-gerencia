import { useQuery } from "@tanstack/react-query";
import {
  X,
  Calendar,
  DollarSign,
  FileText,
  AlertTriangle,
  Building2,
  Info
} from "lucide-react";
import { convenioService } from "@/modules/convenios/services/convenioService";
import { StatusBadge } from "@/modules/shared/components/StatusBadge";
import { formatCurrency, formatDate } from "@/modules/shared/utils/format";

function calcDiasRestantes(dataFim: string | null | undefined): number | null {
  if (!dataFim) return null;
  return Math.ceil(
    (new Date(dataFim).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
}

type Props = {
  convenioId: string;
  convenioTitulo: string;
  onClose: () => void;
};

export const ResumoModal = ({ convenioId, convenioTitulo, onClose }: Props) => {
  const { data: convenio, isLoading } = useQuery({
    queryKey: ["convenio-resumo", convenioId],
    queryFn: () => convenioService.getById(convenioId),
  });

  const pendenciasAbertas = convenio?.pendencias?.filter(
    (p) => p.status === "ABERTA" || p.status === "EM_ANDAMENTO"
  ).length ?? 0;

  const totalContratos = convenio?.contratos?.length ?? 0;
  const totalEmendas = convenio?.emendas?.length ?? 0;
  const totalAditivos = convenio?.aditivos?.length ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Resumo do convênio</h2>
            <p className="text-sm text-slate-500 truncate max-w-[350px]">{convenioTitulo}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-4 space-y-5">
          {isLoading ? (
            <div className="py-12 text-center text-sm text-slate-400">Carregando resumo...</div>
          ) : !convenio ? (
            <div className="py-12 text-center text-sm text-slate-400">Convênio não encontrado.</div>
          ) : (
            <>
              {/* Status + código */}
              <div className="flex items-center gap-3">
                <StatusBadge status={convenio.status} />
                <span className="text-sm text-slate-500 font-medium">{convenio.codigo}</span>
                {convenio.esfera && (
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {convenio.esfera}
                  </span>
                )}
              </div>

              {/* Valores financeiros */}
              <div className="grid grid-cols-2 gap-3">
                <InfoCard
                  icon={<DollarSign className="h-4 w-4 text-emerald-500" />}
                  label="Valor Global"
                  value={formatCurrency(convenio.valorGlobal)}
                />
                <InfoCard
                  icon={<DollarSign className="h-4 w-4 text-blue-500" />}
                  label="Repasse"
                  value={formatCurrency(convenio.valorRepasse)}
                />
                <InfoCard
                  icon={<DollarSign className="h-4 w-4 text-amber-500" />}
                  label="Contrapartida"
                  value={formatCurrency(convenio.valorContrapartida)}
                />
                {convenio.financeiroContas?.valorLiberadoTotal && (
                  <InfoCard
                    icon={<DollarSign className="h-4 w-4 text-teal-500" />}
                    label="Liberado Total"
                    value={formatCurrency(convenio.financeiroContas.valorLiberadoTotal)}
                  />
                )}
              </div>

              {/* Vigência */}
              {(() => {
                const diasRestantes = calcDiasRestantes(convenio.dataFimVigencia);
                return (
                  <div className="rounded-xl border border-slate-100 p-4 space-y-2">
                    <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      Vigência
                    </h4>
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Início: {formatDate(convenio.dataInicioVigencia)}</span>
                      <span>Fim: {formatDate(convenio.dataFimVigencia)}</span>
                    </div>
                    {diasRestantes !== null && (
                      <p
                        className={`text-xs font-medium ${
                          diasRestantes < 0
                            ? "text-red-600"
                            : diasRestantes <= 30
                            ? "text-amber-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {diasRestantes < 0
                          ? `Vencido há ${Math.abs(diasRestantes)} dias`
                          : `${diasRestantes} dias restantes`}
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* Entidades relacionadas */}
              <div className="rounded-xl border border-slate-100 p-4 space-y-2">
                <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  Relações
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-slate-400">Secretaria:</span>{" "}
                    <span className="text-slate-700 font-medium">
                      {convenio.secretaria?.nome ?? "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Órgão:</span>{" "}
                    <span className="text-slate-700 font-medium">
                      {convenio.orgao?.nome ?? "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contagens */}
              <div className="grid grid-cols-2 gap-3">
                <CountCard
                  icon={<FileText className="h-4 w-4 text-blue-500" />}
                  label="Contratos"
                  count={totalContratos}
                />
                <CountCard
                  icon={<FileText className="h-4 w-4 text-violet-500" />}
                  label="Emendas"
                  count={totalEmendas}
                />
                <CountCard
                  icon={<Info className="h-4 w-4 text-cyan-500" />}
                  label="Aditivos"
                  count={totalAditivos}
                />
                <CountCard
                  icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
                  label="Pendências abertas"
                  count={pendenciasAbertas}
                  highlight={pendenciasAbertas > 0}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
        {icon} {label}
      </div>
      <p className="text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function CountCard({
  icon,
  label,
  count,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-2.5 ${
        highlight ? "border-amber-200 bg-amber-50/50" : "border-slate-100"
      }`}
    >
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
        {icon} {label}
      </div>
      <p
        className={`text-lg font-bold ${
          highlight ? "text-amber-700" : "text-slate-800"
        }`}
      >
        {count}
      </p>
    </div>
  );
}
