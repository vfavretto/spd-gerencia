import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  Wallet,
  Hammer,
  BarChart3,
  MessageSquare,
  Loader2,
  ArrowLeft,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Tabs, TabList, Tab, TabPanel } from '../components/ui/Tabs';
import { TrafficLightBadge, getTrafficLightStatus } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { StatusBadge } from '../components/StatusBadge';
import { convenioService } from '../services/convenioService';
import { aditivoService } from '../services/aditivoService';
import { formatCurrency, formatDate } from '../utils/format';

// Componentes das Abas
import { AbaGeral } from '../components/convenio/AbaGeral';
import { AbaFinanceira } from '../components/convenio/AbaFinanceira';
import { AbaEngenharia } from '../components/convenio/AbaEngenharia';
import { AbaExecucao } from '../components/convenio/AbaExecucao';
import { AbaDiario } from '../components/convenio/AbaDiario';

export const ConvenioDetalhesPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const convenioId = Number(id);

  const { data: convenio, isLoading, refetch } = useQuery({
    queryKey: ['convenio', id],
    queryFn: () => convenioService.getById(convenioId),
    enabled: !!id
  });

  const { data: vigenciaInfo } = useQuery({
    queryKey: ['vigencia', id],
    queryFn: () => aditivoService.getVigencia(convenioId),
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-primary-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-lg font-semibold">Carregando convênio...</p>
        </div>
      </div>
    );
  }

  if (!convenio) {
    return (
      <div className="space-y-6">
        <div className="glass-panel p-6 text-center">
          <p className="text-slate-600">O convênio solicitado não foi encontrado.</p>
          <button
            onClick={() => navigate('/convenios')}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para lista
          </button>
        </div>
      </div>
    );
  }

  // Calcular valores financeiros
  const valorGlobal = Number(convenio.valorGlobal) || 0;
  const valorContratado = convenio.contratos?.reduce(
    (acc, c) => acc + Number(c.valorContrato || 0),
    0
  ) || 0;
  const valorPago = convenio.contratos?.reduce(
    (total, c) => total + (c.medicoes?.reduce((m, med) => m + Number(med.valorPago || 0), 0) || 0),
    0
  ) || 0;
  const saldoDisponivel = valorGlobal - valorContratado;
  const percentualExecutado = valorGlobal > 0 ? (valorPago / valorGlobal) * 100 : 0;

  const pendenciasAbertas = convenio.pendencias?.filter(
    (p) => p.status === 'ABERTA' || p.status === 'EM_ANDAMENTO'
  ).length || 0;

  const vigenciaStatus = getTrafficLightStatus(vigenciaInfo?.diasRestantes ?? null);

  const vigenciaExpirada = vigenciaInfo?.vigenciaExpirada ?? false;

  return (
    <div className="space-y-6">
      {/* Botão Voltar */}
      <button
        onClick={() => navigate('/convenios')}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para lista
      </button>

      {/* Alerta de Vigência Expirada */}
      {vigenciaExpirada && convenio.status !== 'CONCLUIDO' && convenio.status !== 'CANCELADO' && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-rose-700">Vigência Expirada</h4>
            <p className="text-sm text-rose-600 mt-1">
              Este convênio está com a vigência expirada. É necessário registrar um aditivo de prazo 
              para continuar executando ações. Acesse a aba "Geral" e clique em "Aditivar".
            </p>
          </div>
        </div>
      )}

      {/* Header Fixo */}
      <header className="glass-panel">
        <div className="flex flex-col gap-4 p-6 lg:flex-row lg:items-start lg:justify-between">
          {/* Info Principal */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={convenio.status} />
              <TrafficLightBadge
                status={vigenciaStatus}
                label={
                  vigenciaInfo?.diasRestantes != null
                    ? vigenciaInfo.diasRestantes < 0
                      ? `Vencido há ${Math.abs(vigenciaInfo.diasRestantes)} dias`
                      : `${vigenciaInfo.diasRestantes} dias restantes`
                    : undefined
                }
              />
              {pendenciasAbertas > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {pendenciasAbertas} pendência{pendenciasAbertas > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">
                {convenio.numeroTermo || convenio.codigo}
              </p>
              <h1 className="text-2xl font-bold text-slate-900">{convenio.titulo}</h1>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600">{convenio.objeto}</p>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              {convenio.dataAssinatura && (
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Calendar className="h-4 w-4" />
                  Assinado em {formatDate(convenio.dataAssinatura)}
                </div>
              )}
              {convenio.secretaria && (
                <div className="text-slate-500">
                  <span className="font-medium">{convenio.secretaria.sigla || convenio.secretaria.nome}</span>
                </div>
              )}
            </div>
          </div>

          {/* Card Resumo Financeiro */}
          <div className="w-full rounded-2xl bg-slate-50 p-4 lg:w-80">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Resumo Financeiro
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Valor Convênio:</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(valorGlobal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contratado:</span>
                <span className="font-medium text-primary-600">
                  {formatCurrency(valorContratado)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pago:</span>
                <span className="font-medium text-emerald-600">
                  {formatCurrency(valorPago)}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between">
                <span className="font-medium text-slate-700">Saldo:</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(saldoDisponivel)}
                </span>
              </div>
            </div>
            <div className="mt-3">
              <ProgressBar
                value={percentualExecutado}
                showLabel
                label="Execução"
                size="sm"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Sistema de Abas */}
      <section className="glass-panel">
        <Tabs defaultTab="geral">
          <TabList className="px-6 pt-2">
            <Tab value="geral" icon={<FileText className="h-4 w-4" />}>
              Geral
            </Tab>
            <Tab value="financeira" icon={<Wallet className="h-4 w-4" />}>
              Financeira
            </Tab>
            <Tab value="engenharia" icon={<Hammer className="h-4 w-4" />}>
              Engenharia
            </Tab>
            <Tab value="execucao" icon={<BarChart3 className="h-4 w-4" />}>
              Execução
            </Tab>
            <Tab
              value="diario"
              icon={<MessageSquare className="h-4 w-4" />}
              badge={pendenciasAbertas}
            >
              Diário
            </Tab>
          </TabList>

          <div className="px-6 pb-6">
            <TabPanel value="geral">
              <AbaGeral convenio={convenio} onUpdate={refetch} />
            </TabPanel>

            <TabPanel value="financeira">
              <AbaFinanceira convenio={convenio} onUpdate={refetch} />
            </TabPanel>

            <TabPanel value="engenharia">
              <AbaEngenharia convenio={convenio} onUpdate={refetch} />
            </TabPanel>

            <TabPanel value="execucao">
              <AbaExecucao convenio={convenio} onUpdate={refetch} />
            </TabPanel>

            <TabPanel value="diario">
              <AbaDiario convenio={convenio} onUpdate={refetch} />
            </TabPanel>
          </div>
        </Tabs>
      </section>
    </div>
  );
};

