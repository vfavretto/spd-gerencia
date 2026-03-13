import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addDays,
  isBefore,
  isSameDay,
  parseISO,
  startOfDay,
} from "date-fns";
import {
  CalendarClock,
  CalendarPlus,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Filter,
  MapPin,
  Pencil,
  RefreshCcw,
  Search,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { agendaService } from "@/modules/agenda/services/agendaService";
import { convenioService } from "@/modules/convenios/services/convenioService";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { tipoEventoOptions } from "@/modules/shared/constants";
import { formatDateTimeBR, formatRelativeDate } from "@/modules/shared/lib/date";
import { cn } from "@/modules/shared/lib/utils";
import type {
  EventoAgenda,
  EventoOrigem,
  TipoEvento,
} from "@/modules/shared/types";
import { usePermissions } from "@/modules/shared/hooks/usePermissions";
import { Badge } from "@/modules/shared/ui/badge";
import { Button } from "@/modules/shared/ui/button";
import { Input } from "@/modules/shared/ui/input";
import { Label } from "@/modules/shared/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/modules/shared/ui/sheet";
import { toast } from "@/modules/shared/ui/toaster";

const manualEventSchema = z.object({
  titulo: z.string().optional(),
  descricao: z.string().optional(),
  descricaoComplementar: z.string().optional(),
  tipo: z
    .enum([
      "REUNIAO",
      "PRESTACAO_CONTAS",
      "ENTREGA_DOCUMENTOS",
      "VENCIMENTO_ETAPA",
      "OUTROS",
    ])
    .optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  local: z.string().optional(),
  responsavel: z.string().optional(),
  convenioId: z.string().optional(),
});

type AgendaFormData = z.infer<typeof manualEventSchema>;
type EditorMode = "create" | "edit";
type BucketKey = "atrasados" | "hoje" | "proximos" | "futuro";

const bucketMeta: Record<
  BucketKey,
  { title: string; subtitle: string; accent: string; empty: string }
> = {
  atrasados: {
    title: "Atrasados",
    subtitle: "O que já venceu e exige ação imediata.",
    accent: "border-rose-200 bg-rose-50/70",
    empty: "Nenhum evento atrasado.",
  },
  hoje: {
    title: "Hoje",
    subtitle: "Compromissos e vencimentos do dia.",
    accent: "border-amber-200 bg-amber-50/70",
    empty: "Nada previsto para hoje.",
  },
  proximos: {
    title: "Próximos 7 dias",
    subtitle: "Janela curta para planejamento operacional.",
    accent: "border-sky-200 bg-sky-50/70",
    empty: "Nenhum evento para os próximos 7 dias.",
  },
  futuro: {
    title: "Futuro",
    subtitle: "Itens já registrados para acompanhamento adiante.",
    accent: "border-emerald-200 bg-emerald-50/70",
    empty: "Nenhum evento futuro.",
  },
};

const typeBadgeClass: Record<TipoEvento, string> = {
  REUNIAO: "bg-sky-100 text-sky-700",
  PRESTACAO_CONTAS: "bg-amber-100 text-amber-700",
  ENTREGA_DOCUMENTOS: "bg-emerald-100 text-emerald-700",
  VENCIMENTO_ETAPA: "bg-rose-100 text-rose-700",
  OUTROS: "bg-slate-100 text-slate-700",
};

const originLabel: Record<EventoOrigem, string> = {
  MANUAL: "Manual",
  PENDENCIA: "Pendência",
};

const originBadgeClass: Record<EventoOrigem, string> = {
  MANUAL: "bg-slate-900 text-white",
  PENDENCIA: "bg-violet-100 text-violet-700",
};

const toDateTimeInputValue = (value?: string | null) => {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const getBucketKey = (evento: EventoAgenda): BucketKey => {
  const today = startOfDay(new Date());
  const eventDate = startOfDay(parseISO(evento.dataInicio));
  const upcomingLimit = addDays(today, 7);

  if (isBefore(eventDate, today)) return "atrasados";
  if (isSameDay(eventDate, today)) return "hoje";
  if (eventDate <= upcomingLimit) return "proximos";
  return "futuro";
};

const getEventSummary = (evento: EventoAgenda) => {
  if (evento.origem === "PENDENCIA") {
    return evento.pendencia?.descricao ?? evento.descricao ?? "Pendência vinculada";
  }
  return evento.descricao ?? "Sem descrição adicional.";
};

export const CalendarioPage = () => {
  const queryClient = useQueryClient();
  const { canCreate, canUpdate, canDelete } = usePermissions();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>("create");
  const [selectedEvento, setSelectedEvento] = useState<EventoAgenda | null>(null);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTipo, setSelectedTipo] = useState<"TODOS" | TipoEvento>("TODOS");
  const [selectedOrigem, setSelectedOrigem] = useState<"TODOS" | EventoOrigem>("TODOS");
  const [selectedConvenioId, setSelectedConvenioId] = useState("TODOS");
  const [showConcluidos, setShowConcluidos] = useState(false);

  const eventosQuery = useQuery({
    queryKey: ["agenda"],
    queryFn: () => agendaService.listEventos(),
  });

  const conveniosQuery = useQuery({
    queryKey: ["convenios", { lite: true }],
    queryFn: () => convenioService.list(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AgendaFormData>({
    resolver: zodResolver(manualEventSchema),
    defaultValues: {
      tipo: "REUNIAO",
    },
  });

  useEffect(() => {
    if (!editorOpen) {
      reset({
        titulo: "",
        descricao: "",
        descricaoComplementar: "",
        tipo: "REUNIAO",
        dataInicio: "",
        dataFim: "",
        local: "",
        responsavel: "",
        convenioId: "",
      });
      return;
    }

    if (!selectedEvento) {
      reset({
        titulo: "",
        descricao: "",
        descricaoComplementar: "",
        tipo: "REUNIAO",
        dataInicio: "",
        dataFim: "",
        local: "",
        responsavel: "",
        convenioId: "",
      });
      return;
    }

    reset({
      titulo: selectedEvento.titulo,
      descricao: selectedEvento.descricao ?? "",
      descricaoComplementar: selectedEvento.descricaoComplementar ?? "",
      tipo: selectedEvento.tipo,
      dataInicio: toDateTimeInputValue(selectedEvento.dataInicio),
      dataFim: toDateTimeInputValue(selectedEvento.dataFim),
      local: selectedEvento.local ?? "",
      responsavel: selectedEvento.responsavel ?? "",
      convenioId: selectedEvento.convenio?.id ?? selectedEvento.convenioId ?? "",
    });
  }, [editorOpen, reset, selectedEvento]);

  const createMutation = useMutation({
    mutationFn: (payload: AgendaFormData) =>
      agendaService.createEvento({
        titulo: payload.titulo!.trim(),
        descricao: payload.descricao?.trim() || null,
        tipo: payload.tipo ?? "REUNIAO",
        dataInicio: payload.dataInicio!,
        dataFim: payload.dataFim || null,
        local: payload.local?.trim() || null,
        responsavel: payload.responsavel?.trim() || null,
        convenioId: payload.convenioId || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agenda"] });
      toast.success("Evento criado com sucesso.");
      setEditorOpen(false);
    },
    onError: () => {
      toast.error("Não foi possível criar o evento.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof agendaService.updateEvento>[1];
    }) => agendaService.updateEvento(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["agenda"] });
      const successMessage =
        selectedEvento?.origem === "PENDENCIA"
          ? "Observações do evento atualizadas."
          : "Evento atualizado com sucesso.";
      toast.success(successMessage);
      setSelectedEvento((current) =>
        current?.id === variables.id ? null : current
      );
      setEditorOpen(false);
    },
    onError: () => {
      toast.error("Não foi possível atualizar o evento.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => agendaService.removeEvento(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agenda"] });
      toast.success("Evento excluído com sucesso.");
    },
    onError: () => {
      toast.error("Não foi possível excluir o evento.");
    },
  });

  const eventos = eventosQuery.data ?? [];

  const filteredEventos = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return eventos
      .filter((evento) => {
        if (!showConcluidos && evento.concluidoEm) return false;
        if (selectedTipo !== "TODOS" && evento.tipo !== selectedTipo) return false;
        if (selectedOrigem !== "TODOS" && evento.origem !== selectedOrigem) {
          return false;
        }
        if (
          selectedConvenioId !== "TODOS" &&
          (evento.convenio?.id ?? evento.convenioId) !== selectedConvenioId
        ) {
          return false;
        }
        if (!normalizedSearch) return true;

        const haystack = [
          evento.titulo,
          evento.descricao,
          evento.descricaoComplementar,
          evento.local,
          evento.responsavel,
          evento.convenio?.titulo,
          evento.pendencia?.descricao,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedSearch);
      })
      .sort(
        (a, b) =>
          new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime()
      );
  }, [eventos, search, selectedTipo, selectedOrigem, selectedConvenioId, showConcluidos]);

  const bucketedEventos = useMemo(() => {
    const initial: Record<BucketKey, EventoAgenda[]> = {
      atrasados: [],
      hoje: [],
      proximos: [],
      futuro: [],
    };

    return filteredEventos.reduce((acc, evento) => {
      acc[getBucketKey(evento)].push(evento);
      return acc;
    }, initial);
  }, [filteredEventos]);

  const totalConcluidos = eventos.filter((evento) => Boolean(evento.concluidoEm)).length;

  const openCreateEditor = () => {
    setEditorMode("create");
    setSelectedEvento(null);
    setEditorOpen(true);
  };

  const openEditEditor = (evento: EventoAgenda) => {
    setEditorMode("edit");
    setSelectedEvento(evento);
    setEditorOpen(true);
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id]
    );
  };

  const handleDelete = (evento: EventoAgenda) => {
    if (evento.origem === "PENDENCIA") return;
    if (!window.confirm(`Excluir o evento "${evento.titulo}"?`)) return;
    deleteMutation.mutate(evento.id);
  };

  const onSubmit = (data: AgendaFormData) => {
    if (editorMode === "create" || selectedEvento?.origem === "MANUAL") {
      if (!data.titulo?.trim()) {
        toast.error("Informe o título do evento.");
        return;
      }

      if (!data.dataInicio) {
        toast.error("Informe a data e hora de início.");
        return;
      }

      if (editorMode === "create") {
        createMutation.mutate(data);
        return;
      }

      if (!selectedEvento) return;

      updateMutation.mutate({
        id: selectedEvento.id,
        payload: {
          titulo: data.titulo.trim(),
          descricao: data.descricao?.trim() || null,
          tipo: data.tipo ?? "REUNIAO",
          dataInicio: data.dataInicio,
          dataFim: data.dataFim || null,
          local: data.local?.trim() || null,
          responsavel: data.responsavel?.trim() || null,
          convenioId: data.convenioId || null,
        },
      });
      return;
    }

    if (!selectedEvento) return;

    updateMutation.mutate({
      id: selectedEvento.id,
      payload: {
        descricaoComplementar: data.descricaoComplementar?.trim() || null,
        local: data.local?.trim() || null,
        responsavel: data.responsavel?.trim() || null,
      },
    });
  };

  const isEditingAutoEvent = selectedEvento?.origem === "PENDENCIA";
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendário operacional"
        subtitle="Acompanhe eventos manuais e pendências com prazo em uma fila temporal focada em priorização."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => eventosQuery.refetch()}
              disabled={eventosQuery.isFetching}
            >
              <RefreshCcw className="h-4 w-4" />
              Atualizar
            </Button>
            {canCreate("evento") && (
              <Button onClick={openCreateEditor}>
                <CalendarPlus className="h-4 w-4" />
                Novo evento
              </Button>
            )}
          </div>
        }
      />

      <section className="glass-panel p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por título, convênio, responsável ou pendência"
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
              <Filter className="h-4 w-4" />
              {filteredEventos.length} evento(s) visível(is)
            </div>

            <button
              type="button"
              onClick={() => setShowConcluidos((current) => !current)}
              className={cn(
                "rounded-2xl border px-4 py-3 text-sm font-medium transition",
                showConcluidos
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              )}
            >
              {showConcluidos
                ? `Ocultar concluídos (${totalConcluidos})`
                : `Mostrar concluídos (${totalConcluidos})`}
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
            <select
              className="form-input"
              value={selectedTipo}
              onChange={(event) =>
                setSelectedTipo(event.target.value as "TODOS" | TipoEvento)
              }
            >
              <option value="TODOS">Todos os tipos</option>
              {tipoEventoOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              className="form-input"
              value={selectedOrigem}
              onChange={(event) =>
                setSelectedOrigem(
                  event.target.value as "TODOS" | EventoOrigem
                )
              }
            >
              <option value="TODOS">Todas as origens</option>
              <option value="MANUAL">Somente manuais</option>
              <option value="PENDENCIA">Somente pendências</option>
            </select>

            <select
              className="form-input md:col-span-2"
              value={selectedConvenioId}
              onChange={(event) => setSelectedConvenioId(event.target.value)}
            >
              <option value="TODOS">Todos os convênios</option>
              {conveniosQuery.data?.map((convenio) => (
                <option key={convenio.id} value={convenio.id}>
                  {convenio.codigo} · {convenio.titulo}
                </option>
              ))}
            </select>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Pendências concluídas ficam ocultas por padrão para manter foco operacional.
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        {(Object.keys(bucketMeta) as BucketKey[]).map((bucketKey) => {
          const bucket = bucketMeta[bucketKey];
          const items = bucketedEventos[bucketKey];

          return (
            <div
              key={bucketKey}
              className={cn(
                "glass-panel flex min-h-[28rem] flex-col border p-4",
                bucket.accent
              )}
            >
              <div className="border-b border-slate-200/80 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {bucket.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">{bucket.subtitle}</p>
                  </div>
                  <Badge variant="secondary">{items.length}</Badge>
                </div>
              </div>

              <div className="mt-4 flex-1 space-y-3">
                {items.map((evento) => {
                  const expanded = expandedIds.includes(evento.id);
                  const manualEvent = evento.origem === "MANUAL";
                  const canEditEvent = canUpdate("evento");
                  const canDeleteEvent = manualEvent && canDelete("evento");
                  const summary = getEventSummary(evento);

                  return (
                    <article
                      key={evento.id}
                      className={cn(
                        "rounded-3xl border border-white/60 bg-white/90 p-4 shadow-sm transition",
                        evento.concluidoEm && "border-emerald-200 bg-emerald-50/70"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={cn(
                                "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                                typeBadgeClass[evento.tipo]
                              )}
                            >
                              {tipoEventoOptions.find(
                                (option) => option.value === evento.tipo
                              )?.label ?? "Evento"}
                            </span>
                            <span
                              className={cn(
                                "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                                originBadgeClass[evento.origem]
                              )}
                            >
                              {originLabel[evento.origem]}
                            </span>
                            {evento.concluidoEm && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Concluído
                              </span>
                            )}
                          </div>

                          <div>
                            <h4 className="text-base font-semibold text-slate-900">
                              {evento.titulo}
                            </h4>
                            <p className="mt-1 text-sm text-slate-600">{summary}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleExpanded(evento.id)}
                          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
                        >
                          {expanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      <div className="mt-4 grid gap-2 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Clock3 className="h-4 w-4 text-slate-400" />
                          <span>{formatDateTimeBR(evento.dataInicio)}</span>
                          <span className="text-slate-400">
                            ({formatRelativeDate(evento.dataInicio)})
                          </span>
                        </div>
                        {evento.local && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            <span>{evento.local}</span>
                          </div>
                        )}
                        {evento.responsavel && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-slate-400" />
                            <span>{evento.responsavel}</span>
                          </div>
                        )}
                      </div>

                      {expanded && (
                        <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                          {evento.convenio && (
                            <div className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                              Convênio:{" "}
                              <strong className="text-slate-900">
                                {evento.convenio.codigo} · {evento.convenio.titulo}
                              </strong>
                            </div>
                          )}

                          {evento.descricaoComplementar && (
                            <div className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                              Observações adicionais:{" "}
                              <strong className="text-slate-900">
                                {evento.descricaoComplementar}
                              </strong>
                            </div>
                          )}

                          {evento.origem === "PENDENCIA" && evento.pendencia && (
                            <div className="rounded-2xl bg-violet-50 px-3 py-2 text-sm text-violet-700">
                              Evento sincronizado automaticamente com a pendência do convênio.
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2">
                            {canEditEvent && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditEditor(evento)}
                              >
                                <Pencil className="h-4 w-4" />
                                {evento.origem === "MANUAL"
                                  ? "Editar evento"
                                  : "Editar observações"}
                              </Button>
                            )}
                            {canDeleteEvent && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(evento)}
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                                Excluir
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}

                {items.length === 0 && (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-sm text-slate-500">
                    {bucket.empty}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>

      <Sheet open={editorOpen} onOpenChange={setEditorOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>
              {editorMode === "create"
                ? "Novo evento"
                : selectedEvento?.origem === "MANUAL"
                  ? "Editar evento"
                  : "Editar observações do evento"}
            </SheetTitle>
            <SheetDescription>
              {editorMode === "create"
                ? "Cadastre compromissos manuais da agenda."
                : selectedEvento?.origem === "MANUAL"
                  ? "Atualize todos os campos do evento manual."
                  : "Eventos gerados por pendência permitem apenas observações, local e responsável."}
            </SheetDescription>
          </SheetHeader>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {isEditingAutoEvent ? (
              <div className="space-y-5">
                <div className="rounded-3xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-800">
                  <div className="font-semibold">{selectedEvento?.titulo}</div>
                  <p className="mt-1">
                    {selectedEvento?.pendencia?.descricao ?? selectedEvento?.descricao}
                  </p>
                  <p className="mt-2 text-violet-700">
                    Data vinculada: {formatDateTimeBR(selectedEvento?.dataInicio)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricaoComplementar">
                    Observações adicionais
                  </Label>
                  <textarea
                    id="descricaoComplementar"
                    rows={4}
                    className="form-input min-h-[120px]"
                    {...register("descricaoComplementar")}
                    placeholder="Anotações de contexto para a equipe"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="local">Local</Label>
                    <Input
                      id="local"
                      {...register("local")}
                      placeholder="Sala, endereço ou link"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="responsavel">Responsável</Label>
                    <Input
                      id="responsavel"
                      {...register("responsavel")}
                      placeholder="Responsável pelo acompanhamento"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título</Label>
                    <Input
                      id="titulo"
                      {...register("titulo")}
                      placeholder="Ex: Reunião com órgão concedente"
                    />
                    {errors.titulo && (
                      <p className="text-xs text-rose-500">{errors.titulo.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo</Label>
                    <select id="tipo" className="form-input" {...register("tipo")}>
                      {tipoEventoOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <textarea
                    id="descricao"
                    rows={4}
                    className="form-input min-h-[120px]"
                    {...register("descricao")}
                    placeholder="Contexto, pauta ou orientações do evento"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="dataInicio">Início</Label>
                    <Input
                      id="dataInicio"
                      type="datetime-local"
                      {...register("dataInicio")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataFim">Fim</Label>
                    <Input
                      id="dataFim"
                      type="datetime-local"
                      {...register("dataFim")}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="local">Local</Label>
                    <Input
                      id="local"
                      {...register("local")}
                      placeholder="Sala, endereço ou link"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="responsavel">Responsável</Label>
                    <Input
                      id="responsavel"
                      {...register("responsavel")}
                      placeholder="Quem conduz o evento"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="convenioId">Convênio relacionado</Label>
                  <select id="convenioId" className="form-input" {...register("convenioId")}>
                    <option value="">Nenhum</option>
                    {conveniosQuery.data?.map((convenio) => (
                      <option key={convenio.id} value={convenio.id}>
                        {convenio.codigo} · {convenio.titulo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <SheetFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditorOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <CalendarClock className="h-4 w-4" />
                {isSubmitting
                  ? "Salvando..."
                  : editorMode === "create"
                    ? "Adicionar evento"
                    : "Salvar alterações"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
};
