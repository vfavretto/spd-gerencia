import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  Send
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { Convenio, StatusPendencia } from "@/modules/shared/types";
import { pendenciaService } from "@/modules/convenios/services/pendenciaService";
import { formatDateBR } from "@/modules/shared/lib/date";
import { Badge } from "@/modules/shared/ui/badge";
import { Button } from "@/modules/shared/ui/button";
import { Input } from "@/modules/shared/ui/input";
import { Label } from "@/modules/shared/ui/label";
import { toast } from "@/modules/shared/ui/toaster";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/modules/shared/ui/dialog";

type Props = {
  convenio: Convenio;
  onUpdate: () => void;
};

const statusConfig: Record<StatusPendencia, { label: string; variant: "destructive" | "warning" | "success" | "secondary"; icon: typeof AlertTriangle }> = {
  ABERTA: { label: "Aberta", variant: "destructive", icon: AlertTriangle },
  EM_ANDAMENTO: { label: "Em Andamento", variant: "warning", icon: Clock },
  RESOLVIDA: { label: "Resolvida", variant: "success", icon: CheckCircle },
  CANCELADA: { label: "Cancelada", variant: "secondary", icon: CheckCircle }
};

const prioridadeLabel: Record<number, { label: string; color: string }> = {
  1: { label: "Alta", color: "text-rose-600 bg-rose-100" },
  2: { label: "Média", color: "text-amber-600 bg-amber-100" },
  3: { label: "Baixa", color: "text-slate-600 bg-slate-100" }
};

export function AbaDiario({ convenio, onUpdate }: Props) {
  const queryClient = useQueryClient();
  const [showNovaPendencia, setShowNovaPendencia] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<string>("");
  const pendencias = convenio.pendencias || [];

  type PendenciaFormData = {
    descricao: string;
    responsavel: string;
    prazo: string;
    prioridade: number;
    status: StatusPendencia;
    orgaoResponsavel: string;
  };

  const { register, handleSubmit, reset } = useForm<PendenciaFormData>({
    defaultValues: {
      descricao: '',
      responsavel: '',
      prazo: '',
      prioridade: 2,
      status: 'ABERTA',
      orgaoResponsavel: ""
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: { descricao: string; responsavel?: string; prazo?: string; prioridade: number; status: StatusPendencia; orgaoResponsavel?: string }) => 
      pendenciaService.create(convenio.id, {
        descricao: data.descricao,
        responsavel: data.responsavel || null,
        prazo: data.prazo || null,
        prioridade: data.prioridade,
        status: data.status,
        orgaoResponsavel: data.orgaoResponsavel || null
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["convenio", String(convenio.id)] });
      toast.success("Pendência registrada!");
      setShowNovaPendencia(false);
      reset();
      onUpdate();
    },
    onError: () => {
      toast.error("Erro ao registrar pendência");
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: StatusPendencia }) =>
      pendenciaService.update(convenio.id, id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["convenio", String(convenio.id)] });
      toast.success("Status atualizado!");
      onUpdate();
    }
  });

  const onSubmit = (data: PendenciaFormData) => {
    createMutation.mutate({
      ...data,
      prazo: data.prazo || undefined,
      prioridade: Number(data.prioridade)
    });
  };

  const pendenciasFiltradas = filtroStatus
    ? pendencias.filter((p) => p.status === filtroStatus)
    : pendencias;

  const countByStatus = {
    ABERTA: pendencias.filter((p) => p.status === "ABERTA").length,
    EM_ANDAMENTO: pendencias.filter((p) => p.status === "EM_ANDAMENTO").length,
    RESOLVIDA: pendencias.filter((p) => p.status === "RESOLVIDA").length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Diário de Pendências
        </h3>
        <Button onClick={() => setShowNovaPendencia(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Pendência
        </Button>
      </div>

      {/* Filtros por Status */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFiltroStatus("")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            filtroStatus === ""
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Todas ({pendencias.length})
        </button>
        <button
          onClick={() => setFiltroStatus("ABERTA")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            filtroStatus === "ABERTA"
              ? "bg-rose-600 text-white"
              : "bg-rose-100 text-rose-700 hover:bg-rose-200"
          }`}
        >
          Abertas ({countByStatus.ABERTA})
        </button>
        <button
          onClick={() => setFiltroStatus("EM_ANDAMENTO")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            filtroStatus === "EM_ANDAMENTO"
              ? "bg-amber-600 text-white"
              : "bg-amber-100 text-amber-700 hover:bg-amber-200"
          }`}
        >
          Em Andamento ({countByStatus.EM_ANDAMENTO})
        </button>
        <button
          onClick={() => setFiltroStatus("RESOLVIDA")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            filtroStatus === "RESOLVIDA"
              ? "bg-emerald-600 text-white"
              : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
          }`}
        >
          Resolvidas ({countByStatus.RESOLVIDA})
        </button>
      </div>

      {/* Lista de Pendências */}
      {pendenciasFiltradas.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-slate-300" />
          <h4 className="mt-4 font-medium text-slate-700">
            {filtroStatus ? "Nenhuma pendência com este status" : "Nenhuma pendência registrada"}
          </h4>
          <p className="mt-1 text-sm text-slate-500">
            Registre pendências para acompanhar problemas e ações necessárias
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendenciasFiltradas.map((pendencia) => {
            const config = statusConfig[pendencia.status];
            const prioridade = prioridadeLabel[pendencia.prioridade || 2];
            const StatusIcon = config.icon;

            return (
              <div
                key={pendencia.id}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start gap-3">
                  {/* Ícone de Status */}
                  <div
                    className={`rounded-full p-2 ${
                      config.variant === "destructive"
                        ? "bg-rose-100 text-rose-600"
                        : config.variant === "warning"
                          ? "bg-amber-100 text-amber-600"
                          : config.variant === "success"
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <StatusIcon className="h-4 w-4" />
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-slate-900">
                        {pendencia.descricao}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${prioridade.color}`}
                        >
                          {prioridade.label}
                        </span>
                        <Badge variant={config.variant}>
                          {config.label}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      {pendencia.responsavel && (
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {pendencia.responsavel}
                        </span>
                      )}
                      {pendencia.orgaoResponsavel && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">
                          {pendencia.orgaoResponsavel}
                        </span>
                      )}
                      {pendencia.prazo && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Prazo: {formatDateBR(pendencia.prazo)}
                        </span>
                      )}
                      {pendencia.criadoPor && (
                        <span>
                          Por: {pendencia.criadoPor.nome}
                        </span>
                      )}
                    </div>

                    {pendencia.resolucao && (
                      <div className="mt-2 rounded-lg bg-emerald-50 p-2 text-sm text-emerald-700">
                        <strong>Resolução:</strong> {pendencia.resolucao}
                      </div>
                    )}

                    {/* Ações de Status */}
                    {pendencia.status !== "RESOLVIDA" && pendencia.status !== "CANCELADA" && (
                      <div className="mt-3 flex gap-2">
                        {pendencia.status === "ABERTA" && (
                          <button
                            onClick={() =>
                              updateStatusMutation.mutate({
                                id: pendencia.id,
                                status: "EM_ANDAMENTO"
                              })
                            }
                            className="rounded-lg bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-200"
                          >
                            Iniciar
                          </button>
                        )}
                        <button
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: pendencia.id,
                              status: "RESOLVIDA"
                            })
                          }
                          className="rounded-lg bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-200"
                        >
                          Resolver
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Nova Pendência */}
      <Dialog open={showNovaPendencia} onOpenChange={(open) => !open && setShowNovaPendencia(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Pendência</DialogTitle>
            <DialogDescription>
              Registre um problema ou ação necessária
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Descrição *</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                rows={3}
                {...register("descricao")}
                placeholder="Descreva a pendência ou problema..."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Responsável</Label>
                <Input
                  {...register("responsavel")}
                  placeholder="Quem deve resolver?"
                />
              </div>
              <div className="space-y-2">
                <Label>Órgão Responsável</Label>
                <Input
                  {...register("orgaoResponsavel")}
                  placeholder="Ex: SPD, Secretaria X"
                />
              </div>
              <div className="space-y-2">
                <Label>Prazo</Label>
                <Input type="date" {...register("prazo")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Prioridade</Label>
              <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" {...register("prioridade")}>
                <option value={1}>Alta</option>
                <option value={2}>Média</option>
                <option value={3}>Baixa</option>
              </select>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setShowNovaPendencia(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Registrando..." : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Registrar
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

