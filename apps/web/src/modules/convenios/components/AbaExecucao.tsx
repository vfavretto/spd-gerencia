import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BarChart3, TrendingUp, Calendar, DollarSign, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import type { Convenio, ValoresVigentes } from "@/modules/shared/types";
import { formatDateBR } from "@/modules/shared/lib/date";
import { formatCurrency } from "@/modules/shared/utils/format";
import { Progress, ProgressCircle } from "@/modules/shared/ui/progress";
import { Button } from "@/modules/shared/ui/button";
import { ConfirmDialog } from "@/modules/shared/components/ConfirmDialog";
import { convenioService } from "@/modules/convenios/services/convenioService";
import { toast } from "@/modules/shared/ui/toaster";

type Props = {
  convenio: Convenio;
  valoresVigentes?: ValoresVigentes;
  onUpdate: () => void;
};

export function AbaExecucao({ convenio, valoresVigentes, onUpdate }: Props) {
  const queryClient = useQueryClient();
  const [showConcluirConfirm, setShowConcluirConfirm] = useState(false);
  const [showCancelarConfirm, setShowCancelarConfirm] = useState(false);

  const contratos = convenio.contratos || [];

  // Agregar todas as medições
  const todasMedicoes = contratos.flatMap((c) =>
    (c.medicoes || []).map((m) => ({
      ...m,
      contratoNumero: c.numeroContrato || `Contrato ${c.id}`
    }))
  ).sort((a, b) => new Date(b.dataMedicao).getTime() - new Date(a.dataMedicao).getTime());

  // Calcular totais
  const valorGlobal = valoresVigentes?.valorGlobalVigente ?? (Number(convenio.valorGlobal) || 0);
  const totalContratado = contratos.reduce((acc, c) => acc + Number(c.valorContrato || 0), 0);
  const totalMedido = todasMedicoes.reduce((acc, m) => acc + Number(m.valorMedido || 0), 0);
  const totalPago = todasMedicoes.reduce((acc, m) => acc + Number(m.valorPago || 0), 0);

  const percentualContratado = valorGlobal > 0 ? (totalContratado / valorGlobal) * 100 : 0;
  const percentualMedido = totalContratado > 0 ? (totalMedido / totalContratado) * 100 : 0;
  const percentualPago = totalMedido > 0 ? (totalPago / totalMedido) * 100 : 0;

  // Calcular dias sem medição
  const ultimaMedicao = todasMedicoes[0];
  const diasSemMedicao = ultimaMedicao
    ? Math.floor(
        (new Date().getTime() - new Date(ultimaMedicao.dataMedicao).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  const podeFinalizarOuCancelar =
    convenio.status !== "CONCLUIDO" && convenio.status !== "CANCELADO";

  const concluirMutation = useMutation({
    mutationFn: () => convenioService.concluir(convenio.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["convenio", String(convenio.id)] });
      queryClient.invalidateQueries({ queryKey: ["convenios"] });
      toast.success("Convênio concluído com sucesso!");
      setShowConcluirConfirm(false);
      onUpdate();
    },
    onError: () => {
      toast.error("Erro ao concluir convênio.");
    }
  });

  const cancelarMutation = useMutation({
    mutationFn: () => convenioService.cancelar(convenio.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["convenio", String(convenio.id)] });
      queryClient.invalidateQueries({ queryKey: ["convenios"] });
      toast.success("Convênio cancelado com sucesso!");
      setShowCancelarConfirm(false);
      onUpdate();
    },
    onError: () => {
      toast.error("Erro ao cancelar convênio.");
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">
          Acompanhamento da Execução
        </h3>
        {podeFinalizarOuCancelar && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCancelarConfirm(true)}
              className="border-rose-200 text-rose-700 hover:bg-rose-50"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancelar Convênio
            </Button>
            <Button
              onClick={() => setShowConcluirConfirm(true)}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Concluir Convênio
            </Button>
          </div>
        )}
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-white border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Contratado</p>
              <p className="text-xl font-bold text-slate-900 mt-1">
                {formatCurrency(totalContratado)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {percentualContratado.toFixed(1)}% do valor global
              </p>
            </div>
            <ProgressCircle value={percentualContratado} size={48} />
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Medido</p>
              <p className="text-xl font-bold text-primary-600 mt-1">
                {formatCurrency(totalMedido)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {percentualMedido.toFixed(1)}% do contratado
              </p>
            </div>
            <ProgressCircle value={percentualMedido} size={48} />
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Pago</p>
              <p className="text-xl font-bold text-emerald-600 mt-1">
                {formatCurrency(totalPago)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {percentualPago.toFixed(1)}% do medido
              </p>
            </div>
            <ProgressCircle value={percentualPago} size={48} variant="success" />
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Dias sem Medição</p>
              <p className="text-xl font-bold text-slate-900 mt-1">
                {diasSemMedicao !== null ? diasSemMedicao : "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {ultimaMedicao
                  ? `Última: ${formatDateBR(ultimaMedicao.dataMedicao)}`
                  : "Nenhuma medição"}
              </p>
            </div>
            <div className="rounded-full bg-slate-100 p-3">
              <Calendar className="h-6 w-6 text-slate-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Barras de Progresso */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
        <h4 className="font-medium text-slate-700 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Progresso Geral
        </h4>
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Contratação</span>
              <span>{percentualContratado.toFixed(1)}%</span>
            </div>
            <Progress value={percentualContratado} />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Execução Física</span>
              <span>{percentualMedido.toFixed(1)}%</span>
            </div>
            <Progress value={percentualMedido} variant="success" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Execução Financeira</span>
              <span>{percentualPago.toFixed(1)}%</span>
            </div>
            <Progress value={percentualPago} variant="success" />
          </div>
        </div>
      </div>

      {/* Timeline de Medições */}
      <div className="space-y-4">
        <h4 className="font-medium text-slate-700 flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Histórico de Medições
        </h4>

        {todasMedicoes.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
            <DollarSign className="mx-auto h-12 w-12 text-slate-300" />
            <h4 className="mt-4 font-medium text-slate-700">
              Nenhuma medição registrada
            </h4>
            <p className="mt-1 text-sm text-slate-500">
              As medições aparecerão aqui quando forem registradas nos contratos
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {todasMedicoes.map((medicao, index) => (
              <div
                key={medicao.id}
                className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4"
              >
                {/* Indicador Timeline */}
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600 font-bold text-sm">
                    {medicao.numeroMedicao}
                  </div>
                  {index < todasMedicoes.length - 1 && (
                    <div className="w-0.5 flex-1 bg-slate-200 mt-2" />
                  )}
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-slate-900">
                        Medição Nº {medicao.numeroMedicao}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(medicao as { contratoNumero: string }).contratoNumero} • {formatDateBR(medicao.dataMedicao)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">
                        {formatCurrency(Number(medicao.valorMedido))}
                      </p>
                      {medicao.valorPago && (
                        <p className="text-sm text-emerald-600">
                          Pago: {formatCurrency(Number(medicao.valorPago))}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Barra de progresso individual */}
                  {medicao.percentualFisico && (
                    <div className="mt-2">
                      <Progress
                        value={Number(medicao.percentualFisico)}
                        size="sm"
                        showLabel
                      />
                    </div>
                  )}

                  {medicao.observacoes && (
                    <p className="mt-2 text-sm text-slate-600 bg-slate-50 rounded-lg p-2">
                      {medicao.observacoes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Diálogos de Confirmação */}
      <ConfirmDialog
        open={showConcluirConfirm}
        onOpenChange={setShowConcluirConfirm}
        title="Concluir convênio"
        description={`Deseja realmente concluir o convênio "${convenio.titulo}"? Esta ação marcará o convênio como finalizado e não poderá ser desfeita.`}
        confirmLabel={concluirMutation.isPending ? "Concluindo..." : "Sim, concluir convênio"}
        onConfirm={() => {
          if (!concluirMutation.isPending) {
            concluirMutation.mutate();
          }
        }}
        variant="danger"
      />

      <ConfirmDialog
        open={showCancelarConfirm}
        onOpenChange={setShowCancelarConfirm}
        title="Cancelar convênio"
        description={`Deseja realmente cancelar o convênio "${convenio.titulo}"? Esta ação é irreversível e o convênio não poderá mais ser executado.`}
        confirmLabel={cancelarMutation.isPending ? "Cancelando..." : "Sim, cancelar convênio"}
        onConfirm={() => {
          if (!cancelarMutation.isPending) {
            cancelarMutation.mutate();
          }
        }}
        variant="danger"
      />
    </div>
  );
}
