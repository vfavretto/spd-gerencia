import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  FileText,
  Filter,
  FolderOpen,
  Link2,
  MailPlus,
  Pencil,
  RefreshCcw,
  Search,
  Send,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  comunicadoService,
  type ComunicadoFilters,
} from "@/modules/comunicados/services/comunicadoService";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { ConfirmDialog } from "@/modules/shared/components/ConfirmDialog";
import { CanCreateComunicado } from "@/modules/shared/components/PermissionGate";
import { tipoComunicadoOptions } from "@/modules/shared/constants";
import { usePermissions } from "@/modules/shared/hooks/usePermissions";
import type { Comunicado } from "@/modules/shared/types";
import { formatDate } from "@/modules/shared/utils/format";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/modules/shared/ui";

const comunicadoSchema = z.object({
  protocolo: z.string().min(3, "Informe o número do protocolo"),
  assunto: z.string().min(3, "Assunto obrigatório"),
  conteudo: z.string().optional(),
  tipo: z.enum(["ENTRADA", "SAIDA"]),
  dataRegistro: z.string().optional(),
  origem: z.string().optional(),
  destino: z.string().optional(),
  responsavel: z.string().optional(),
  arquivoUrl: z.string().optional(),
});

type ComunicadoForm = z.infer<typeof comunicadoSchema>;
type FormMode = "create" | "edit";

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

const getTipoClasses = (tipo: Comunicado["tipo"]) =>
  tipo === "ENTRADA"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-amber-200 bg-amber-50 text-amber-700";

const toDateInputValue = (value?: string | null) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getFormValues = (comunicado?: Comunicado | null): ComunicadoForm => ({
  protocolo: comunicado?.protocolo ?? "",
  assunto: comunicado?.assunto ?? "",
  conteudo: comunicado?.conteudo ?? "",
  tipo: comunicado?.tipo ?? "ENTRADA",
  dataRegistro: toDateInputValue(comunicado?.dataRegistro),
  origem: comunicado?.origem ?? "",
  destino: comunicado?.destino ?? "",
  responsavel: comunicado?.responsavel ?? "",
  arquivoUrl: comunicado?.arquivoUrl ?? "",
});

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
      {label}
    </p>
    <p className="mt-2 text-sm font-medium text-slate-700">
      {value?.trim() ? value : "Nao informado"}
    </p>
  </div>
);

const SummaryCard = ({
  label,
  value,
  helper,
  icon: Icon,
  tone,
}: SummaryCardProps) => (
  <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md">
    <CardContent className="flex items-center justify-between gap-4 p-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <strong className="text-2xl font-semibold tracking-tight text-slate-900">
            {value}
          </strong>
          <span className="truncate text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
            {helper}
          </span>
        </div>
      </div>
      <span className={`rounded-2xl p-3 ${tone}`}>
        <Icon className="h-5 w-5" />
      </span>
    </CardContent>
  </Card>
);

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

  const {
    register,
    handleSubmit,
    reset,
    resetField,
    watch,
    formState: { errors },
  } = useForm<ComunicadoForm>({
    resolver: zodResolver(comunicadoSchema),
    defaultValues: getFormValues(),
  });

  const tipoSelecionado = watch("tipo");
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

  useEffect(() => {
    if (!isFormOpen) {
      reset(getFormValues());
      return;
    }

    reset(getFormValues(editingComunicado));
  }, [editingComunicado, isFormOpen, reset]);

  useEffect(() => {
    if (!isFormOpen) return;

    if (tipoSelecionado === "ENTRADA") {
      resetField("destino");
      return;
    }

    resetField("origem");
  }, [isFormOpen, resetField, tipoSelecionado]);

  const handleFilterChange = (newFilters: Partial<ComunicadoFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
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
    reset(getFormValues());
  };

  const createMutation = useMutation({
    mutationFn: (payload: ComunicadoForm) => comunicadoService.create(payload),
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
      payload: ComunicadoForm;
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

  const handleDeleteRequest = (comunicado: Comunicado) => {
    setComunicadoToDelete(comunicado);
  };

  const handleFormSubmit = (data: ComunicadoForm) => {
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
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Historico
              </p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">
                Comunicados cadastrados
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {comunicados.length}{" "}
                {comunicados.length === 1 ? "comunicado encontrado" : "comunicados encontrados"}
              </p>
            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,0.8fr))]">
              <div className="lg:min-w-[280px]">
                <Label
                  htmlFor="comunicados-search"
                  className="flex items-center gap-2 text-slate-600"
                >
                  <Search className="h-4 w-4" />
                  Buscar
                </Label>
                <Input
                  id="comunicados-search"
                  placeholder="Protocolo, assunto, origem ou destino"
                  value={filters.search || ""}
                  onChange={(event) => handleFilterChange({ search: event.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="comunicados-responsavel" className="text-slate-600">
                  Responsavel
                </Label>
                <Input
                  id="comunicados-responsavel"
                  placeholder="Nome"
                  value={filters.responsavel || ""}
                  onChange={(event) =>
                    handleFilterChange({ responsavel: event.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="comunicados-data-inicio" className="text-slate-600">
                  Data inicio
                </Label>
                <Input
                  id="comunicados-data-inicio"
                  type="date"
                  value={filters.dataInicio || ""}
                  onChange={(event) =>
                    handleFilterChange({ dataInicio: event.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="comunicados-data-fim" className="text-slate-600">
                  Data fim
                </Label>
                <Input
                  id="comunicados-data-fim"
                  type="date"
                  value={filters.dataFim || ""}
                  onChange={(event) =>
                    handleFilterChange({ dataFim: event.target.value })
                  }
                />
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                >
                  <X className="h-4 w-4" />
                  Limpar
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              <Filter className="h-3.5 w-3.5" />
              Tipo
            </span>
            <button
              type="button"
              onClick={() => handleFilterChange({ tipo: "" })}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                !filters.tipo
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              Todos
            </button>
            {tipoComunicadoOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleFilterChange({ tipo: option.value })}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  filters.tipo === option.value
                    ? option.value === "ENTRADA"
                      ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                      : "border-amber-200 bg-amber-100 text-amber-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
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
              {comunicados.map((item) => {
                const isEntrada = item.tipo === "ENTRADA";

                return (
                  <Card
                    key={item.id}
                    className="overflow-hidden border-slate-200 bg-white transition duration-300 hover:border-primary-200 hover:shadow-lg"
                  >
                    <div
                      className={`h-1.5 w-full ${
                        isEntrada ? "bg-emerald-400" : "bg-amber-400"
                      }`}
                    />
                    <CardContent className="p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                            {item.protocolo}
                          </p>
                          <h4 className="text-lg font-semibold leading-tight text-slate-900">
                            {item.assunto}
                          </h4>
                        </div>
                        <Badge className={`border ${getTipoClasses(item.tipo)}`}>
                          {item.tipo === "ENTRADA" ? "Entrada" : "Saida"}
                        </Badge>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatDate(item.dataRegistro)}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
                          <UserRound className="h-3.5 w-3.5" />
                          {item.responsavel?.trim() || "Sem responsavel"}
                        </span>
                        {item.arquivoUrl && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-primary-700">
                            <Link2 className="h-3.5 w-3.5" />
                            Com anexo
                          </span>
                        )}
                      </div>

                      <p className="mt-4 text-sm leading-6 text-slate-600">
                        {item.conteudo?.trim() || "Sem conteudo complementar informado."}
                      </p>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                            Origem
                          </p>
                          <p className="mt-2 text-sm font-medium text-slate-700">
                            {item.origem?.trim() || "Nao informada"}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                            Destinatario
                          </p>
                          <p className="mt-2 text-sm font-medium text-slate-700">
                            {item.destino?.trim() || "Nao informado"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                        <span className="text-sm font-medium text-slate-500">
                          Revise o registro ou abra os detalhes completos
                        </span>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            aria-label={`Abrir detalhes de ${item.assunto}`}
                            onClick={() => setSelectedComunicado(item)}
                          >
                            Abrir painel
                          </Button>
                          {canUpdate("comunicado") && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              aria-label={`Editar comunicado ${item.assunto}`}
                              onClick={() => openEditDialog(item)}
                            >
                              <Pencil className="h-4 w-4" />
                              Editar
                            </Button>
                          )}
                          {canDelete("comunicado") && (
                            <button
                              type="button"
                              aria-label={`Excluir comunicado ${item.assunto}`}
                              onClick={() => handleDeleteRequest(item)}
                              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl px-4 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              Excluir
                            </button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeFormDialog();
            return;
          }

          setIsFormOpen(true);
        }}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto rounded-[32px] border border-slate-200 bg-white p-0 shadow-2xl sm:max-w-4xl">
          <DialogHeader className="border-b border-slate-100 px-6 py-5">
            <DialogTitle className="flex items-center gap-3 text-xl text-slate-900">
              <span className="rounded-2xl bg-primary-50 p-2.5 text-primary-600">
                {formMode === "create" ? (
                  <MailPlus className="h-5 w-5" />
                ) : (
                  <Pencil className="h-5 w-5" />
                )}
              </span>
              {formMode === "create" ? "Registrar comunicado" : "Editar comunicado"}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              {formMode === "create"
                ? "Cadastre o protocolo com os campos ja usados pelo sistema."
                : "Atualize os dados do comunicado selecionado sem perder o contexto do historico."}
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-6 px-6 py-6" onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="protocolo">Protocolo</Label>
                    <Input
                      id="protocolo"
                      {...register("protocolo")}
                      placeholder="Ex: COM-001/2026"
                    />
                    {errors.protocolo && (
                      <p className="mt-1 text-xs text-rose-500">
                        {errors.protocolo.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Tipo</Label>
                    <div className="mt-1 grid grid-cols-2 gap-2">
                      {tipoComunicadoOptions.map((option) => (
                        <label
                          key={option.value}
                          className={`cursor-pointer rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                            tipoSelecionado === option.value
                              ? option.value === "ENTRADA"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-amber-200 bg-amber-50 text-amber-700"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                          }`}
                        >
                          <input
                            type="radio"
                            value={option.value}
                            className="sr-only"
                            {...register("tipo")}
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="assunto">Assunto</Label>
                  <Input
                    id="assunto"
                    {...register("assunto")}
                    placeholder="Resumo do comunicado"
                  />
                  {errors.assunto && (
                    <p className="mt-1 text-xs text-rose-500">{errors.assunto.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="conteudo">Conteudo</Label>
                  <textarea
                    id="conteudo"
                    rows={6}
                    className="mt-1 flex w-full rounded-[24px] border border-slate-200 bg-white/60 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    {...register("conteudo")}
                    placeholder="Detalhes, contexto e encaminhamentos"
                  />
                </div>
              </div>

              <div className="space-y-4 rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Metadados
                  </p>
                  <h4 className="mt-2 text-lg font-semibold text-slate-900">
                    Contexto do registro
                  </h4>
                  <p className="mt-1 text-sm text-slate-500">
                    Campos auxiliares para localizar, atribuir e vincular o documento.
                  </p>
                </div>

                <div>
                  <Label htmlFor="dataRegistro">Data do registro</Label>
                  <Input id="dataRegistro" type="date" {...register("dataRegistro")} />
                </div>

                {tipoSelecionado === "ENTRADA" ? (
                  <div>
                    <Label htmlFor="origem">Origem</Label>
                    <Input
                      id="origem"
                      {...register("origem")}
                      placeholder="Secretaria ou orgao remetente"
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="destino">Destinatario</Label>
                    <Input
                      id="destino"
                      {...register("destino")}
                      placeholder="Setor ou responsavel destinatario"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="responsavel">Responsavel</Label>
                  <Input
                    id="responsavel"
                    {...register("responsavel")}
                    placeholder="Nome do servidor"
                  />
                </div>

                <div>
                  <Label htmlFor="arquivoUrl">Link do arquivo</Label>
                  <Input
                    id="arquivoUrl"
                    {...register("arquivoUrl")}
                    placeholder="https://"
                  />
                </div>
              </div>
            </div>

            {(createMutation.isError || updateMutation.isError) && (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                Não foi possível salvar o comunicado. Verifique os dados e tente novamente.
              </p>
            )}

            <DialogFooter className="gap-2 border-t border-slate-100 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={closeFormDialog}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? formMode === "create"
                    ? "Registrando..."
                    : "Salvando..."
                  : formMode === "create"
                    ? "Registrar comunicado"
                    : "Salvar alteracoes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Sheet
        open={Boolean(selectedComunicado)}
        onOpenChange={(open) => !open && setSelectedComunicado(null)}
      >
        <SheetContent
          side="right"
          className="w-full overflow-y-auto border-l border-slate-200 bg-white p-0 sm:max-w-xl"
        >
          {selectedComunicado && (
            <>
              <SheetHeader className="border-b border-slate-100 px-6 py-5 text-left">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className={`border ${getTipoClasses(selectedComunicado.tipo)}`}>
                      {selectedComunicado.tipo === "ENTRADA" ? "Entrada" : "Saida"}
                    </Badge>
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      {selectedComunicado.protocolo}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {canUpdate("comunicado") && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        aria-label={`Editar comunicado ${selectedComunicado.assunto}`}
                        onClick={() => openEditDialog(selectedComunicado)}
                      >
                        <Pencil className="h-4 w-4" />
                        Editar
                      </Button>
                    )}
                    {canDelete("comunicado") && (
                      <button
                        type="button"
                        aria-label={`Excluir comunicado ${selectedComunicado.assunto}`}
                        onClick={() => handleDeleteRequest(selectedComunicado)}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-xl px-4 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Excluir
                      </button>
                    )}
                  </div>
                </div>

                <SheetTitle className="mt-3 text-2xl leading-tight text-slate-900">
                  {selectedComunicado.assunto}
                </SheetTitle>
                <SheetDescription className="text-sm leading-6 text-slate-500">
                  Detalhamento completo do comunicado selecionado para consulta e manutencao.
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 px-6 py-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailItem
                    label="Data do registro"
                    value={formatDate(selectedComunicado.dataRegistro)}
                  />
                  <DetailItem
                    label="Responsavel"
                    value={selectedComunicado.responsavel}
                  />
                  <DetailItem label="Origem" value={selectedComunicado.origem} />
                  <DetailItem label="Destinatario" value={selectedComunicado.destino} />
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Conteudo
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {selectedComunicado.conteudo?.trim() ||
                      "Sem conteudo complementar informado para este comunicado."}
                  </p>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="rounded-2xl bg-primary-50 p-2 text-primary-600">
                      <Link2 className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Documento vinculado</p>
                      <p className="text-sm text-slate-500">
                        Acesse o arquivo associado quando houver link cadastrado.
                      </p>
                    </div>
                  </div>
                  {selectedComunicado.arquivoUrl ? (
                    <a
                      href={selectedComunicado.arquivoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-500"
                    >
                      <Link2 className="h-4 w-4" />
                      Abrir anexo
                    </a>
                  ) : (
                    <p className="mt-4 text-sm text-slate-500">
                      Nenhum link de arquivo foi informado para este comunicado.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

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
