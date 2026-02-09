import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, CalendarPlus, RefreshCcw } from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { tipoEventoOptions } from "@/modules/shared/constants";
import { agendaService } from "@/modules/agenda/services/agendaService";
import { convenioService } from "@/modules/convenios/services/convenioService";
import { formatDate } from "@/modules/shared/utils/format";

const eventoSchema = z.object({
  titulo: z.string().min(3, "Informe o título do evento"),
  descricao: z.string().optional(),
  tipo: z
    .enum(["REUNIAO", "PRESTACAO_CONTAS", "ENTREGA_DOCUMENTOS", "VENCIMENTO_ETAPA", "OUTROS"])
    .optional(),
  dataInicio: z.string().min(1, "Defina a data de início"),
  dataFim: z.string().optional(),
  local: z.string().optional(),
  responsavel: z.string().optional(),
  convenioId: z.number().optional()
});

type EventoForm = z.infer<typeof eventoSchema>;

export const CalendarioPage = () => {
  const queryClient = useQueryClient();

  const eventosQuery = useQuery({
    queryKey: ["agenda"],
    queryFn: () => agendaService.listEventos()
  });

  const conveniosQuery = useQuery({
    queryKey: ["convenios", { lite: true }],
    queryFn: () => convenioService.list()
  });

  const eventos = eventosQuery.data ?? [];

  const eventosAgrupados = useMemo(() => {
    const groups: Record<string, typeof eventos> = {};
    eventos.forEach((evento) => {
      const month = new Date(evento.dataInicio).toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric"
      });
      groups[month] = groups[month] ? [...groups[month], evento] : [evento];
    });
    return groups;
  }, [eventos]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<EventoForm>({
    resolver: zodResolver(eventoSchema),
    defaultValues: {
      tipo: "REUNIAO"
    }
  });

  const createMutation = useMutation({
    mutationFn: (payload: EventoForm) =>
      agendaService.createEvento({
        ...payload,
        dataFim: payload.dataFim || null,
        convenioId: payload.convenioId || null
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agenda"] });
      reset({ tipo: "REUNIAO" } as EventoForm);
    }
  });

  const onSubmit = (data: EventoForm) => {
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agenda integrada"
        subtitle="Reuniões, prazos de prestação de contas e eventos associados aos convênios."
        actions={
          <button
            onClick={() => eventosQuery.refetch()}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:text-primary-600"
          >
            <RefreshCcw className="h-4 w-4" />
            Atualizar
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="glass-panel">
          <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
            <CalendarPlus className="h-5 w-5 text-primary-500" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Novo compromisso
              </h3>
              <p className="text-sm text-slate-500">
                Cadastre reuniões, entregas e marcos importantes.
              </p>
            </div>
          </div>
          <form className="grid gap-4 p-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="form-label">Título</label>
                <input
                  className="form-input"
                  {...register("titulo")}
                  placeholder="Ex: Prestação de contas parcial"
                />
                {errors.titulo && (
                  <p className="text-xs text-rose-500">{errors.titulo.message}</p>
                )}
              </div>
              <div>
                <label className="form-label">Tipo</label>
                <select className="form-input" {...register("tipo")}>
                  {tipoEventoOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="form-label">Descrição</label>
              <textarea
                rows={3}
                className="form-input"
                {...register("descricao")}
                placeholder="Informações adicionais"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="form-label">Início</label>
                <input type="datetime-local" className="form-input" {...register("dataInicio")} />
                {errors.dataInicio && (
                  <p className="text-xs text-rose-500">{errors.dataInicio.message}</p>
                )}
              </div>
              <div>
                <label className="form-label">Fim</label>
                <input type="datetime-local" className="form-input" {...register("dataFim")} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="form-label">Local</label>
                <input
                  className="form-input"
                  {...register("local")}
                  placeholder="Auditório, sala, online..."
                />
              </div>
              <div>
                <label className="form-label">Responsável</label>
                <input
                  className="form-input"
                  {...register("responsavel")}
                  placeholder="Nome do responsável"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Convênio relacionado</label>
              <select
                className="form-input"
                {...register("convenioId", {
                  setValueAs: (value) =>
                    value === "" ? undefined : Number.parseInt(value, 10)
                })}
              >
                <option value="">Nenhum</option>
                {conveniosQuery.data?.map((convenio) => (
                  <option key={convenio.id} value={convenio.id}>
                    {convenio.titulo}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-500 disabled:opacity-70"
              >
                {createMutation.isPending ? "Salvando..." : "Adicionar evento"}
              </button>
            </div>
            {createMutation.isSuccess && (
              <p className="text-sm text-emerald-600">
                Evento registrado com sucesso!
              </p>
            )}
          </form>
        </section>

        <section className="glass-panel p-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <CalendarDays className="h-5 w-5 text-primary-500" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Agenda dos próximos meses
              </h3>
              <p className="text-sm text-slate-500">
                Visualize compromissos organizados por mês.
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-5">
            {Object.entries(eventosAgrupados).map(([mes, lista]) => (
              <div key={mes} className="rounded-3xl border border-slate-100 bg-white/80">
                <div className="border-b border-slate-100 px-5 py-3">
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    {mes}
                  </p>
                </div>
                <div className="divide-y divide-slate-100">
                  {lista.map((evento) => {
                    const tipoColors: Record<string, string> = {
                      REUNIAO: "border-l-blue-400",
                      PRESTACAO_CONTAS: "border-l-amber-400",
                      ENTREGA_DOCUMENTOS: "border-l-emerald-400",
                      VENCIMENTO_ETAPA: "border-l-rose-400",
                      OUTROS: "border-l-slate-400"
                    };
                    const tipoBadgeColors: Record<string, string> = {
                      REUNIAO: "bg-blue-50 text-blue-600",
                      PRESTACAO_CONTAS: "bg-amber-50 text-amber-600",
                      ENTREGA_DOCUMENTOS: "bg-emerald-50 text-emerald-600",
                      VENCIMENTO_ETAPA: "bg-rose-50 text-rose-600",
                      OUTROS: "bg-slate-50 text-slate-600"
                    };
                    return (
                    <div key={evento.id} className={`flex flex-col gap-2 border-l-4 px-5 py-4 ${tipoColors[evento.tipo] ?? "border-l-slate-300"}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${tipoBadgeColors[evento.tipo] ?? "bg-slate-50 text-slate-600"}`}>
                            {tipoEventoOptions.find((opt) => opt.value === evento.tipo)?.label ??
                              "Evento"}
                          </span>
                          <h4 className="text-lg font-semibold text-slate-900">
                            {evento.titulo}
                          </h4>
                        </div>
                        <span className="text-xs text-slate-400">
                          {formatDate(evento.dataInicio)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{evento.descricao}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                        {evento.local && (
                          <span>
                            Local: <strong>{evento.local}</strong>
                          </span>
                        )}
                        {evento.responsavel && (
                          <span>
                            Responsável: <strong>{evento.responsavel}</strong>
                          </span>
                        )}
                        {evento.convenio && (
                          <span>
                            Convênio: <strong>{evento.convenio.titulo}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {eventos.length === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white/50 p-8 text-center text-sm text-slate-400">
                Nenhum evento cadastrado.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
