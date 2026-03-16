import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addDays,
  isBefore,
  isSameDay,
  parseISO,
  startOfDay,
} from "date-fns";
import {
  CalendarPlus,
  RefreshCcw,
} from "lucide-react";
import { useMemo, useState } from "react";
import { agendaService } from "@/modules/agenda/services/agendaService";
import { AgendaFilters } from "@/modules/agenda/components/AgendaFilters";
import { EventoCard } from "@/modules/agenda/components/EventoCard";
import { EventoEditorSheet, type AgendaFormData } from "@/modules/agenda/components/EventoEditorSheet";
import { convenioService } from "@/modules/convenios/services/convenioService";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { cn } from "@/modules/shared/lib/utils";
import type {
  EventoAgenda,
  EventoOrigem,
  TipoEvento,
} from "@/modules/shared/types";
import { usePermissions } from "@/modules/shared/hooks/usePermissions";
import { Badge } from "@/modules/shared/ui/badge";
import { Button } from "@/modules/shared/ui/button";
import { toast } from "@/modules/shared/ui/toaster";

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

const getBucketKey = (evento: EventoAgenda): BucketKey => {
  const today = startOfDay(new Date());
  const eventDate = startOfDay(parseISO(evento.dataInicio));
  const upcomingLimit = addDays(today, 7);

  if (isBefore(eventDate, today)) return "atrasados";
  if (isSameDay(eventDate, today)) return "hoje";
  if (eventDate <= upcomingLimit) return "proximos";
  return "futuro";
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

  const eventos = useMemo(() => eventosQuery.data ?? [], [eventosQuery.data]);

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

      <AgendaFilters
        search={search}
        onSearchChange={setSearch}
        selectedTipo={selectedTipo}
        onTipoChange={setSelectedTipo}
        selectedOrigem={selectedOrigem}
        onOrigemChange={setSelectedOrigem}
        selectedConvenioId={selectedConvenioId}
        onConvenioIdChange={setSelectedConvenioId}
        showConcluidos={showConcluidos}
        onToggleConcluidos={() => setShowConcluidos((c) => !c)}
        totalConcluidos={totalConcluidos}
        filteredCount={filteredEventos.length}
        convenios={conveniosQuery.data ?? []}
      />

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
                {items.map((evento) => (
                  <EventoCard
                    key={evento.id}
                    evento={evento}
                    expanded={expandedIds.includes(evento.id)}
                    onToggleExpand={toggleExpanded}
                    onEdit={openEditEditor}
                    onDelete={handleDelete}
                    canEdit={canUpdate("evento")}
                    canDelete={canDelete("evento")}
                  />
                ))}

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

      <EventoEditorSheet
        open={editorOpen}
        onOpenChange={setEditorOpen}
        editorMode={editorMode}
        selectedEvento={selectedEvento}
        isSubmitting={isSubmitting}
        convenios={conveniosQuery.data ?? []}
        onSubmit={onSubmit}
      />
    </div>
  );
};
