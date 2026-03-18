import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import {
  FileText,
  FolderOpen,
  MailPlus,
  RefreshCcw,
  Send,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  comunicadoService,
  type ComunicadoFilters,
} from "@/modules/comunicados/services/comunicadoService";
import { ComunicadoCard, SummaryCard } from "@/modules/comunicados/components/ComunicadoCard";
import { ComunicadoFilters as Filters } from "@/modules/comunicados/components/ComunicadoFilters";
import { ComunicadoFormDialog, type ComunicadoFormData } from "@/modules/comunicados/components/ComunicadoFormDialog";
import { ComunicadoDetailSheet } from "@/modules/comunicados/components/ComunicadoDetailSheet";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { ConfirmDialog } from "@/modules/shared/components/ConfirmDialog";
import { CanCreateComunicado } from "@/modules/shared/components/PermissionGate";
import { usePermissions } from "@/modules/shared/hooks/usePermissions";
import { formatDate } from "@/modules/shared/lib/format";
import type { Comunicado } from "@/modules/shared/types";
import {
  Badge,
  Button,
} from "@/modules/shared/ui";

type SummaryCardProps = {
  label: string;
  value: string | number;
  helper: string;
  icon: LucideIcon;
  tone: string;
};

const summaryCards = (
  metrics: {
    total: number;
    entradas: number;
    saidas: number;
    responsaveis: number;
  },
): SummaryCardProps[] => [
  {
    label: "Registros visíveis",
    value: metrics.total,
    helper: "contexto atual",
    icon: FolderOpen,
    tone: "bg-primary-50 text-primary-600",
  },
  {
    label: "Entradas",
    value: metrics.entradas,
    helper: "protocolos recebidos",
    icon: MailPlus,
    tone: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Saídas",
    value: metrics.saidas,
    helper: "protocolos expedidos",
    icon: Send,
    tone: "bg-amber-50 text-amber-600",
  },
  {
    label: "Responsáveis",
    value: metrics.responsaveis,
    helper: "servidores citados",
    icon: UserRound,
    tone: "bg-sky-50 text-sky-600",
  },
];

type FormMode = "create" | "edit";

export const ComunicadosPage = () => {
  const queryClient = useQueryClient();
  const { canUpdate, canDelete } = usePermissions();
  const [filters, setFilters] = useState<ComunicadoFilters>({});
  const [selectedComunicado, setSelectedComunicado] = useState<Comunicado | null>(null);
  const [editingComunicado, setEditingComunicado] = useState<Comunicado | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [comunicadoToDelete, setComunicadoToDelete] = useState<Comunicado | null>(null);

  const comunicadosQuery = useQuery({
    queryKey: ["comunicados", filters],
    queryFn: () => comunicadoService.list(filters),
  });

  const comunicados = comunicadosQuery.data ?? [];
  const responsaveis = new Set(
    comunicados
      .map((item) => item.responsavel?.trim())
      .filter((value): value is string => Boolean(value)),
  );
  const metrics = {
    total: comunicados.length,
    entradas: comunicados.filter((item) => item.tipo === "ENTRADA").length,
    saidas: comunicados.filter((item) => item.tipo === "SAIDA").length,
    responsaveis: responsaveis.size,
  };

  const hasActiveFilters = Boolean(
    filters.tipo ||
      filters.search ||
      filters.responsavel ||
      filters.dataInicio ||
      filters.dataFim,
  );

  const closeFormDialog = () => {
    setIsFormOpen(false);
    setEditingComunicado(null);
    setFormMode("create");
  };

  const createMutation = useMutation({
    mutationFn: (payload: ComunicadoFormData) => comunicadoService.create(payload),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["comunicados"] });
      closeFormDialog();
      setSelectedComunicado(created);
      toast.success("Comunicado registrado com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao criar comunicado. Verifique os dados e tente novamente.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ComunicadoFormData;
    }) => comunicadoService.update(id, payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["comunicados"] });
      closeFormDialog();
      setSelectedComunicado(updated);
      toast.success("Comunicado atualizado com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao atualizar comunicado. Verifique os dados e tente novamente.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => comunicadoService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comunicados"] });
      setSelectedComunicado(null);
      setComunicadoToDelete(null);
      toast.success("Comunicado excluido com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao excluir comunicado. Tente novamente.");
    },
  });

  const openCreateDialog = () => {
    setFormMode("create");
    setEditingComunicado(null);
    setIsFormOpen(true);
  };

  const openEditDialog = (comunicado: Comunicado) => {
    setFormMode("edit");
    setEditingComunicado(comunicado);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: ComunicadoFormData) => {
    if (formMode === "edit" && editingComunicado) {
      updateMutation.mutate({ id: editingComunicado.id, payload: data });
      return;
    }

    createMutation.mutate(data);
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Comunicados internos"
        subtitle="Acompanhe protocolos de entrada e saida com uma leitura mais clara do historico e dos registros recentes."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => comunicadosQuery.refetch()}
              disabled={comunicadosQuery.isRefetching}
            >
              <RefreshCcw
                className={`h-4 w-4 ${comunicadosQuery.isRefetching ? "animate-spin" : ""}`}
              />
              Atualizar
            </Button>
            <CanCreateComunicado>
              <Button type="button" onClick={openCreateDialog}>
                <MailPlus className="h-4 w-4" />
                Registrar comunicado
              </Button>
            </CanCreateComunicado>
          </div>
        }
      />

      <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white px-6 py-5 shadow-card">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(79,70,229,0.12),_transparent_28%),radial-gradient(circle_at_left,_rgba(16,185,129,0.1),_transparent_24%)]" />
        <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-2xl">
            <Badge className="border-primary-100 bg-primary-50 px-3 py-1 text-primary-700 hover:bg-primary-50">
              Central de comunicados
            </Badge>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
              Historico com consulta e manutencao no mesmo fluxo
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Localize comunicados mais rapido, revise os dados em painel lateral e
              execute cadastro, edicao e exclusao sem sair da pagina.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            <span className="rounded-full border border-slate-200 bg-white/90 px-4 py-2">
              {metrics.total} itens no contexto
            </span>
            <span className="rounded-full border border-slate-200 bg-white/90 px-4 py-2">
              filtros {hasActiveFilters ? "ativos" : "livres"}
            </span>
            <span className="rounded-full border border-slate-200 bg-white/90 px-4 py-2">
              ultimo registro {comunicados[0] ? formatDate(comunicados[0].dataRegistro) : "--"}
            </span>
          </div>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards(metrics).map((card) => (
          <SummaryCard key={card.label} {...card} />
        ))}
      </div>

      <section className="glass-panel overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-5">
          <Filters
            filters={filters}
            onFilterChange={(newFilters) =>
              setFilters((prev) => ({ ...prev, ...newFilters }))
            }
            onClear={() => setFilters({})}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        <div className="space-y-4 px-6 py-6">
          {comunicadosQuery.isLoading ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-52 animate-pulse rounded-[28px] border border-slate-200 bg-slate-100/70"
                />
              ))}
            </div>
          ) : comunicados.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50/70 px-6 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                <FileText className="h-6 w-6" />
              </div>
              <h4 className="mt-4 text-lg font-semibold text-slate-900">
                Nenhum comunicado encontrado
              </h4>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Ajuste os filtros ou registre um novo comunicado para iniciar o historico.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {comunicados.map((item) => (
                <ComunicadoCard
                  key={item.id}
                  comunicado={item}
                  onOpenPanel={setSelectedComunicado}
                  onEdit={openEditDialog}
                  onDelete={setComunicadoToDelete}
                  canUpdate={canUpdate("comunicado")}
                  canDelete={canDelete("comunicado")}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <ComunicadoFormDialog
        isOpen={isFormOpen}
        formMode={formMode}
        editingComunicado={editingComunicado}
        isSubmitting={isSubmitting}
        hasError={createMutation.isError || updateMutation.isError}
        onClose={closeFormDialog}
        onSubmit={handleFormSubmit}
      />

      <ComunicadoDetailSheet
        comunicado={selectedComunicado}
        onClose={() => setSelectedComunicado(null)}
        onEdit={openEditDialog}
        onDelete={setComunicadoToDelete}
        canUpdate={canUpdate("comunicado")}
        canDelete={canDelete("comunicado")}
      />

      <ConfirmDialog
        open={Boolean(comunicadoToDelete)}
        onOpenChange={(open) => !open && setComunicadoToDelete(null)}
        title="Excluir comunicado"
        description={
          comunicadoToDelete
            ? `O comunicado "${comunicadoToDelete.assunto}" será removido permanentemente.`
            : ""
        }
        confirmLabel={deleteMutation.isPending ? "Excluindo..." : "Excluir"}
        onConfirm={() => {
          if (!comunicadoToDelete || deleteMutation.isPending) return;
          deleteMutation.mutate(comunicadoToDelete.id);
        }}
      />
    </div>
  );
};
