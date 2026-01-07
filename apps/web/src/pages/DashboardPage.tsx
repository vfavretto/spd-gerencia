import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  CalendarClock,
  Files,
  HandCoins,
  RefreshCcw
} from 'lucide-react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { PageHeader } from '../components/shared/PageHeader';
import { StatCard } from '../components/shared/StatCard';
import { dashboardService } from '../services/dashboardService';
import { formatCurrency, formatDate } from '../utils/format';
import { StatusBadge } from '../components/shared/StatusBadge';

export const DashboardPage = () => {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardService.getOverview()
  });

  const stats = [
    {
      label: 'Convênios ativos',
      value: data?.totalConvenios ?? '--',
      helper: 'Registrados no sistema',
      icon: Files,
      trend: {
        label: '+4 este mês',
        positive: true
      }
    },
    {
      label: 'Valor global',
      value: data ? formatCurrency(data.totalValor) : '--',
      helper: 'Somatório aprovado',
      icon: HandCoins
    },
    {
      label: 'Comunicados pendentes',
      value: data?.comunicadosPendentes ?? '--',
      helper: 'Entrada/Saída aguardando ação',
      icon: Activity,
      trend: data && data.comunicadosPendentes > 0
        ? { label: `${data.comunicadosPendentes} pendentes`, positive: false }
        : undefined
    },
    {
      label: 'Próximas entregas',
      value: data?.proximasDatas.length ?? 0,
      helper: 'Eventos críticos próximos',
      icon: CalendarClock
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard de operações"
        subtitle="Visão consolidada dos convênios e prazos estratégicos."
        actions={
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:text-primary-600"
          >
            <RefreshCcw className="h-4 w-4" />
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
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
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
                  <BarChart data={data?.porStatus ?? []}>
                    <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      formatter={(value) => `${value} convênios`}
                      labelFormatter={(label) => `Status: ${label}`}
                    />
                    <Bar dataKey="_count" fill="#818cf8" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-panel h-full p-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Próximos vencimentos
              </h3>
              <p className="text-sm text-slate-500">
                Convênios que exigem atenção imediata
              </p>
              <div className="mt-4 space-y-4">
                {data?.proximasDatas.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col rounded-2xl border border-slate-100 bg-white/60 p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-900">{item.titulo}</p>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="text-sm text-slate-500">
                      Limite: <strong>{formatDate(item.dataFimVigencia)}</strong>
                    </p>
                  </div>
                ))}
                {data?.proximasDatas.length === 0 && (
                  <p className="text-sm text-slate-400">
                    Nenhum prazo futuro encontrado.
                  </p>
                )}
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
