import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  FileText,
  Files,
  HandCoins,
  PiggyBank,
  RefreshCcw,
  TrendingUp,
  Wallet
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Link } from "react-router-dom";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { StatCard } from "@/modules/shared/components/StatCard";
import { dashboardService } from "@/modules/dashboard/services/dashboardService";
import { formatCurrency, formatDate } from "@/modules/shared/utils/format";
import { StatusBadge } from "@/modules/shared/components/StatusBadge";

const COLORS = ["#818cf8", "#34d399", "#fbbf24", "#f87171", "#60a5fa", "#a78bfa"];

const STATUS_COLORS: Record<string, string> = {
  RASCUNHO: "#94a3b8",
  EM_ANALISE: "#fbbf24",
  APROVADO: "#60a5fa",
  EM_EXECUCAO: "#818cf8",
  CONCLUIDO: "#34d399",
  CANCELADO: "#f87171"
};

export const DashboardPage = () => {
  const { data: overview, isLoading: loadingOverview, refetch: refetchOverview, isRefetching: isRefetchingOverview } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: () => dashboardService.getOverview()
  });

  const { data: resumo, isLoading: loadingResumo, refetch: refetchResumo, isRefetching: isRefetchingResumo } = useQuery({
    queryKey: ["dashboard-resumo"],
    queryFn: () => dashboardService.getResumo()
  });

  const isLoading = loadingOverview || loadingResumo;
  const isRefetching = isRefetchingOverview || isRefetchingResumo;

  const handleRefresh = () => {
    refetchOverview();
    refetchResumo();
  };

  // Cards principais
  const mainStats = [
    {
      label: "Convênios ativos",
      value: overview?.totalConvenios ?? "--",
      helper: "Total registrado no sistema",
      icon: Files,
      color: "bg-indigo-50 text-indigo-600"
    },
    {
      label: "Valor global",
      value: resumo ? formatCurrency(resumo.valorGlobalTotal) : "--",
      helper: "Somatório de todos os convênios",
      icon: Wallet,
      color: "bg-emerald-50 text-emerald-600"
    },
    {
      label: "Valor executado",
      value: resumo ? formatCurrency(resumo.execucao.valorTotalMedido) : "--",
      helper: `${resumo?.execucao.percentualMedido ?? 0}% do total`,
      icon: TrendingUp,
      color: "bg-blue-50 text-blue-600"
    },
    {
      label: "Valor pago",
      value: resumo ? formatCurrency(resumo.execucao.valorTotalPago) : "--",
      helper: `${resumo?.execucao.percentualPago ?? 0}% do total`,
      icon: HandCoins,
      color: "bg-amber-50 text-amber-600"
    }
  ];

  // Alertas
  const alertas = resumo?.alertas;
  const hasAlertas = alertas && (
    alertas.conveniosVencendo30Dias > 0 ||
    alertas.pendenciasAtrasadas > 0 ||
    alertas.conveniosSemMedicao60Dias > 0
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard de operações"
        subtitle="Visão consolidada dos convênios, execução e prazos estratégicos."
        actions={
          <button
            onClick={handleRefresh}
            disabled={isRefetching}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:text-primary-600 disabled:opacity-50"
          >
            <RefreshCcw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
            Atualizar
          </button>
        }
      />

      {isLoading ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white/60 p-10 text-center text-slate-500">
          Carregando indicadores...
        </div>
      ) : (
        <>
          {/* Alertas */}
          {hasAlertas && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-semibold">Atenção necessária</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-amber-700">
                {alertas.conveniosVencendo30Dias > 0 && (
                  <span>{alertas.conveniosVencendo30Dias} convênio(s) vencem em 30 dias</span>
                )}
                {alertas.pendenciasAtrasadas > 0 && (
                  <span>{alertas.pendenciasAtrasadas} pendência(s) atrasada(s)</span>
                )}
                {alertas.conveniosSemMedicao60Dias > 0 && (
                  <span>{alertas.conveniosSemMedicao60Dias} convênio(s) sem medição há 60+ dias</span>
                )}
              </div>
            </div>
          )}

          {/* Cards principais */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {mainStats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          {/* Seção Financeira */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Repasse vs Contrapartida */}
            <div className="glass-panel p-6">
              <h3 className="text-lg font-semibold text-slate-900">Composição financeira</h3>
              <p className="text-sm text-slate-500">Repasse vs Contrapartida</p>
              <div className="mt-4 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Repasse", value: resumo?.somaRepasses ?? 0 },
                        { name: "Contrapartida", value: resumo?.somaContrapartidas ?? 0 }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    >
                      <Cell fill="#818cf8" />
                      <Cell fill="#34d399" />
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-indigo-400" />
                  <span className="text-slate-600">Repasse: {formatCurrency(resumo?.somaRepasses ?? 0)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-emerald-400" />
                  <span className="text-slate-600">Contrapartida: {formatCurrency(resumo?.somaContrapartidas ?? 0)}</span>
                </div>
              </div>
            </div>

            {/* Distribuição por esfera */}
            <div className="glass-panel p-6">
              <h3 className="text-lg font-semibold text-slate-900">Por esfera de governo</h3>
              <p className="text-sm text-slate-500">Valor global por origem</p>
              <div className="mt-4 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={resumo?.totalPorEsfera ?? []} layout="vertical">
                    <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} hide />
                    <YAxis type="category" dataKey="esfera" width={80} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="total" fill="#60a5fa" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 space-y-1 text-sm text-slate-600">
                {resumo?.totalPorEsfera.map((item) => (
                  <div key={item.esfera ?? "null"} className="flex justify-between">
                    <span>{item.esfera ?? "Não informado"}</span>
                    <span className="font-medium">{item.quantidade} convênios</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contratos e Pendências */}
            <div className="glass-panel p-6">
              <h3 className="text-lg font-semibold text-slate-900">Contratos e pendências</h3>
              <p className="text-sm text-slate-500">Situação atual</p>
              
              <div className="mt-4 space-y-4">
                {/* Contratos */}
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center gap-2 text-slate-700">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">Contratos</span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-center text-sm">
                    <div>
                      <p className="text-2xl font-bold text-indigo-600">{resumo?.contratos.total ?? 0}</p>
                      <p className="text-slate-500">Total</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{resumo?.contratos.emExecucao ?? 0}</p>
                      <p className="text-slate-500">Em execução</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-emerald-600">{resumo?.contratos.concluidos ?? 0}</p>
                      <p className="text-slate-500">Concluídos</p>
                    </div>
                  </div>
                </div>

                {/* Pendências */}
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Activity className="h-4 w-4" />
                    <span className="font-medium">Pendências</span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-center text-sm">
                    <div>
                      <p className="text-2xl font-bold text-amber-600">{resumo?.pendencias.abertas ?? 0}</p>
                      <p className="text-slate-500">Abertas</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{resumo?.pendencias.emAndamento ?? 0}</p>
                      <p className="text-slate-500">Em andamento</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">{resumo?.pendencias.vencidasHoje ?? 0}</p>
                      <p className="text-slate-500">Atrasadas</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seção de gráficos e listas */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Distribuição por status */}
            <div className="glass-panel overflow-hidden p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Distribuição por status
                  </h3>
                  <p className="text-sm text-slate-500">
                    Situação de todos os convênios cadastrados
                  </p>
                </div>
              </div>
              <div className="mt-6 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overview?.porStatus ?? []}>
                    <XAxis dataKey="status" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={50} />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      formatter={(value) => `${value} convênios`}
                      labelFormatter={(label) => `Status: ${label}`}
                    />
                    <Bar dataKey="_count" radius={[10, 10, 0, 0]}>
                      {overview?.porStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Próximos vencimentos */}
            <div className="glass-panel h-full p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Próximos vencimentos
                  </h3>
                  <p className="text-sm text-slate-500">
                    Convênios que exigem atenção imediata
                  </p>
                </div>
                <CalendarClock className="h-5 w-5 text-slate-400" />
              </div>
              <div className="mt-4 space-y-3">
                {overview?.proximasDatas.map((item) => (
                  <Link
                    key={item.id}
                    to={`/convenios/${item.id}`}
                    className="flex flex-col rounded-2xl border border-slate-100 bg-white/60 p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-900 line-clamp-1">{item.titulo}</p>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      Limite: <strong>{formatDate(item.dataFimVigencia)}</strong>
                    </p>
                  </Link>
                ))}
                {overview?.proximasDatas.length === 0 && (
                  <p className="text-sm text-slate-400">
                    Nenhum prazo futuro encontrado.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Top convênios */}
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Maiores convênios por valor
                </h3>
                <p className="text-sm text-slate-500">
                  Top 5 convênios com maior valor global
                </p>
              </div>
              <PiggyBank className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-slate-500">
                    <th className="pb-3 font-medium">Código</th>
                    <th className="pb-4 font-medium">Título</th>
                    <th className="pb-3 font-medium text-right">Valor global</th>
                    <th className="pb-3 font-medium text-center">Status</th>
                    <th className="pb-3 font-medium text-right">Execução</th>
                  </tr>
                </thead>
                <tbody>
                  {resumo?.topConvenios.map((conv) => (
                    <tr key={conv.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="py-3">
                        <Link to={`/convenios/${conv.id}`} className="font-medium text-indigo-600 hover:underline">
                          {conv.codigo}
                        </Link>
                      </td>
                      <td className="py-3 text-slate-700 line-clamp-1 max-w-xs">{conv.titulo}</td>
                      <td className="py-3 text-right font-medium text-slate-900">
                        {formatCurrency(conv.valorGlobal)}
                      </td>
                      <td className="py-3 text-center">
                        <StatusBadge status={conv.status} />
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-indigo-500 transition-all"
                              style={{ width: `${Math.min(conv.percentualExecutado, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 w-12 text-right">
                            {conv.percentualExecutado}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!resumo?.topConvenios || resumo.topConvenios.length === 0) && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        Nenhum convênio cadastrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resumo de comunicados */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 shadow-md transition-all hover:shadow-lg">
              <div className="absolute inset-x-0 top-0 h-1 bg-amber-400" />
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="font-mono text-2xl font-bold text-slate-900">{overview?.comunicadosPendentes ?? 0}</p>
                  <p className="text-sm text-slate-500">Comunicados pendentes</p>
                </div>
              </div>
            </div>
            
            <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 shadow-md transition-all hover:shadow-lg">
              <div className="absolute inset-x-0 top-0 h-1 bg-indigo-400" />
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100">
                  <FileText className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="font-mono text-2xl font-bold text-slate-900">{formatCurrency(resumo?.contratos.valorTotal ?? 0)}</p>
                  <p className="text-sm text-slate-500">Valor total contratado</p>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 shadow-md transition-all hover:shadow-lg">
              <div className="absolute inset-x-0 top-0 h-1 bg-emerald-400" />
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-mono text-2xl font-bold text-slate-900">{resumo?.pendencias.total ?? 0}</p>
                  <p className="text-sm text-slate-500">Total de pendências registradas</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      
      {isRefetching && (
        <p className="text-xs text-slate-400">Atualizando indicadores...</p>
      )}
    </div>
  );
};
