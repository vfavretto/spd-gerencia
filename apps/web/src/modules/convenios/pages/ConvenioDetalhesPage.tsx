import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Wallet,
  Hammer,
  BarChart3,
  MessageSquare,
  Loader2,
  ArrowLeft,
  Calendar,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/modules/shared/ui/tabs";
import {
  StatusBadge,
  TrafficLightBadge,
  getTrafficLightColor,
} from "@/modules/shared/ui/badge";
import { Progress } from "@/modules/shared/ui/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/modules/shared/ui/card";
import { Button } from "@/modules/shared/ui/button";
import { ConfirmDialog } from "@/modules/shared/components/ConfirmDialog";
import { usePermissions } from "@/modules/shared/hooks";
import { convenioService } from "@/modules/convenios/services/convenioService";
import { aditivoService } from "@/modules/convenios/services/aditivoService";
import { formatCurrency } from "@/modules/shared/utils/format";
import { formatDateBR } from "@/modules/shared/lib/date";
import { toast } from "@/modules/shared/ui/toaster";

// Componentes das Abas
import { AbaGeral } from "@/modules/convenios/components/AbaGeral";
import { AbaFinanceira } from "@/modules/convenios/components/AbaFinanceira";
import { AbaEngenharia } from "@/modules/convenios/components/AbaEngenharia";
import { AbaExecucao } from "@/modules/convenios/components/AbaExecucao";
import { AbaDiario } from "@/modules/convenios/components/AbaDiario";

export const ConvenioDetalhesPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { canDelete } = usePermissions();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    data: convenio,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["convenio", id],
    queryFn: () => convenioService.getById(id!),
    enabled: !!id,
  });

  const { data: vigenciaInfo } = useQuery({
    queryKey: ["vigencia", id],
    queryFn: () => aditivoService.getVigencia(id!),
    enabled: !!id,
  });

  const { data: valoresVigentes } = useQuery({
    queryKey: ["convenio-valores-vigentes", id],
    queryFn: () => convenioService.getValoresVigentes(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => convenioService.remove(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["convenios"] });
      toast.success("Convênio excluído com sucesso!");
      navigate("/convenios");
    },
    onError: () => {
      toast.error("Erro ao excluir convênio");
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-primary">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-lg font-semibold">Carregando convênio...</p>
        </div>
      </div>
    );
  }

  if (!convenio) {
    return (
      <div className="space-y-6">
        <Card className="text-center">
          <CardContent className="py-8">
            <p className="text-muted-foreground">
              O convênio solicitado não foi encontrado.
            </p>
            <Button
              onClick={() => navigate("/convenios")}
              className="mt-4"
              variant="default"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para lista
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Usar valores financeiros do endpoint valoresVigentes (fonte autoritativa)
  const valorGlobal = valoresVigentes?.valorGlobalVigente ?? 0;
  const valorContratado = valoresVigentes?.valorTotalContratado ?? 0;
  const valorPago = valoresVigentes?.valorTotalPago ?? 0;
  const saldoDisponivel = valoresVigentes?.saldoConvenio ?? 0;
  const percentualExecutado = valoresVigentes?.percentualExecutado ?? 0;

  const pendenciasAbertas =
    convenio.pendencias?.filter(
      (p) => p.status === "ABERTA" || p.status === "EM_ANDAMENTO",
    ).length ?? 0;

  const vigenciaColor = getTrafficLightColor(vigenciaInfo?.diasRestantes);
  const vigenciaExpirada = vigenciaInfo?.vigenciaExpirada ?? false;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate("/convenios")}
          className="text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para lista
        </Button>

        {canDelete("convenio") && (
          <Button
            variant="outline"
            onClick={() => setShowDeleteConfirm(true)}
            className="border-rose-200 text-rose-700 hover:bg-rose-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir Convênio
          </Button>
        )}
      </div>

      {/* Alerta de Vigência Expirada */}
      {vigenciaExpirada &&
        convenio.status !== "CONCLUIDO" &&
        convenio.status !== "CANCELADO" && (
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="py-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-destructive">
                  Vigência Expirada
                </h4>
                <p className="text-sm text-destructive/80 mt-1">
                  Este convênio está com a vigência expirada. É necessário
                  registrar um aditivo de prazo para continuar executando ações.
                  Acesse a aba "Geral" e clique em "Aditivar".
                </p>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Header Fixo */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            {/* Info Principal */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={convenio.status} />
                <TrafficLightBadge
                  color={vigenciaColor}
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
                    {pendenciasAbertas} pendência
                    {pendenciasAbertas > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {convenio.numeroTermo || convenio.codigo}
                </p>
                <h1 className="text-2xl font-bold text-foreground">
                  {convenio.titulo}
                </h1>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {convenio.objeto}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                {convenio.dataAssinatura && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Assinado em {formatDateBR(convenio.dataAssinatura)}
                  </div>
                )}
                {convenio.secretaria && (
                  <div className="text-muted-foreground">
                    <span className="font-medium">
                      {convenio.secretaria.sigla || convenio.secretaria.nome}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Card Resumo Financeiro */}
            <Card className="w-full lg:w-80 bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor Convênio:</span>
                  <span className="font-semibold">
                    {formatCurrency(valorGlobal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contratado:</span>
                  <span className="font-medium text-primary">
                    {formatCurrency(Number(valorContratado))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pago:</span>
                  <span className="font-medium text-emerald-600">
                    {formatCurrency(Number(valorPago))}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-medium">Saldo:</span>
                  <span className="font-bold">
                    {formatCurrency(saldoDisponivel)}
                  </span>
                </div>
                <div className="pt-2">
                  <Progress value={percentualExecutado} showLabel size="sm" />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Sistema de Abas */}
      <Card>
        <Tabs defaultValue="geral" className="w-full">
          <CardHeader className="pb-0">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="geral" className="gap-2">
                <FileText className="h-4 w-4" />
                Geral
              </TabsTrigger>
              <TabsTrigger value="financeira" className="gap-2">
                <Wallet className="h-4 w-4" />
                Financeira
              </TabsTrigger>
              <TabsTrigger value="engenharia" className="gap-2">
                <Hammer className="h-4 w-4" />
                Engenharia
              </TabsTrigger>
              <TabsTrigger value="execucao" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Execução
              </TabsTrigger>
              <TabsTrigger value="diario" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Diário
                {pendenciasAbertas > 0 && (
                  <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                    {pendenciasAbertas}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent className="pt-6">
            <TabsContent value="geral">
              <AbaGeral convenio={convenio} onUpdate={refetch} />
            </TabsContent>

            <TabsContent value="financeira">
              <AbaFinanceira
                convenio={convenio}
                valoresVigentes={valoresVigentes}
                onUpdate={refetch}
              />
            </TabsContent>

            <TabsContent value="engenharia">
              <AbaEngenharia
                convenio={convenio}
                valoresVigentes={valoresVigentes}
                onUpdate={refetch}
              />
            </TabsContent>

            <TabsContent value="execucao">
              <AbaExecucao
                convenio={convenio}
                valoresVigentes={valoresVigentes}
                onUpdate={refetch}
              />
            </TabsContent>

            <TabsContent value="diario">
              <AbaDiario convenio={convenio} onUpdate={refetch} />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Excluir convênio"
        description={`Deseja realmente excluir o convênio "${convenio.titulo}"? Esta ação não pode ser desfeita.`}
        confirmLabel={deleteMutation.isPending ? "Excluindo..." : "Excluir"}
        onConfirm={() => {
          if (!deleteMutation.isPending) {
            deleteMutation.mutate();
          }
        }}
        variant="danger"
      />
    </div>
  );
};
