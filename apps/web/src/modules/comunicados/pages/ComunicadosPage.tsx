import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Filter, MailPlus, RefreshCcw, X } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { CanCreateComunicado } from "@/modules/shared/components/PermissionGate";
import { tipoComunicadoOptions } from "@/modules/shared/constants";
import {
  comunicadoService,
  type ComunicadoFilters
} from "@/modules/comunicados/services/comunicadoService";
import { formatDate } from "@/modules/shared/utils/format";

const comunicadoSchema = z.object({
  protocolo: z.string().min(3, "Informe o número do protocolo"),
  assunto: z.string().min(3, "Assunto obrigatório"),
  conteudo: z.string().optional(),
  tipo: z.enum(["ENTRADA", "SAIDA"]),
  dataRegistro: z.string().optional(),
  origem: z.string().optional(),
  destino: z.string().optional(),
  responsavel: z.string().optional(),
  arquivoUrl: z.string().optional()
});

type ComunicadoForm = z.infer<typeof comunicadoSchema>;

export const ComunicadosPage = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ComunicadoFilters>({});

  const comunicadosQuery = useQuery({
    queryKey: ["comunicados", filters],
    queryFn: () => comunicadoService.list(filters)
  });

  const handleFilterChange = (newFilters: Partial<ComunicadoFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Boolean(
    filters.tipo || filters.search || filters.responsavel || filters.dataInicio || filters.dataFim
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<ComunicadoForm>({
    resolver: zodResolver(comunicadoSchema),
    defaultValues: {
      tipo: "ENTRADA"
    }
  });

  const tipoSelecionado = watch("tipo");

  const createMutation = useMutation({
    mutationFn: (payload: ComunicadoForm) =>
      comunicadoService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comunicados"] });
      reset({ tipo: "ENTRADA" } as ComunicadoForm);
    },
    onError: () => {
      toast.error("Erro ao criar comunicado. Verifique os dados e tente novamente.");
    }
  });

  const comunicados = comunicadosQuery.data ?? [];

  const onSubmit = (data: ComunicadoForm) => {
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Comunicados internos"
        subtitle="Controle de protocolos de entrada e saída vinculados aos convênios."
        actions={
          <button
            onClick={() => comunicadosQuery.refetch()}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:text-primary-600"
          >
            <RefreshCcw className="h-4 w-4" />
            Sincronizar
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <CanCreateComunicado>
          <section className="glass-panel">
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
              <MailPlus className="h-5 w-5 text-primary-500" />
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Registrar comunicado
                </h3>
                <p className="text-sm text-slate-500">
                  Use este formulário para documentar o protocolo interno.
                </p>
              </div>
            </div>
            <form className="grid gap-4 p-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="form-label">Protocolo</label>
                <input
                  className="form-input"
                  {...register("protocolo")}
                  placeholder="Ex: COM-001/2025"
                />
                {errors.protocolo && (
                  <p className="text-xs text-rose-500">
                    {errors.protocolo.message}
                  </p>
                )}
              </div>
              <div>
                <label className="form-label">Tipo</label>
                <select className="form-input" {...register("tipo")}>
                  {tipoComunicadoOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="form-label">Assunto</label>
              <input
                className="form-input"
                {...register("assunto")}
                placeholder="Resumo do comunicado"
              />
            </div>

            <div>
              <label className="form-label">Conteúdo</label>
              <textarea
                rows={3}
                className="form-input"
                {...register("conteudo")}
                placeholder="Detalhes e encaminhamentos"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="form-label">Data do registro</label>
                <input
                  type="date"
                  className="form-input"
                  {...register("dataRegistro")}
                />
              </div>
              {tipoSelecionado === "ENTRADA" ? (
                <div>
                  <label className="form-label">Destinatário</label>
                  <input
                    className="form-input"
                    {...register("destino")}
                    placeholder="Setor ou responsável"
                  />
                </div>
              ) : (
                <div>
                  <label className="form-label">Origem</label>
                  <input
                    className="form-input"
                    {...register("origem")}
                    placeholder="Secretaria ou órgão"
                  />
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="form-label">Responsável</label>
                <input
                  className="form-input"
                  {...register("responsavel")}
                  placeholder="Nome do servidor"
                />
              </div>
              <div>
                <label className="form-label">Link do arquivo</label>
                <input
                  className="form-input"
                  {...register("arquivoUrl")}
                  placeholder="https://"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-500 disabled:opacity-70"
              >
                {createMutation.isPending ? "Registrando..." : "Registrar comunicado"}
              </button>
            </div>
            {createMutation.isSuccess && (
              <p className="text-sm text-emerald-600">
                ✓ Comunicado registrado com sucesso!
              </p>
            )}
            {createMutation.isError && (
              <p className="text-sm text-rose-600">
                ✗ Erro ao registrar comunicado. Verifique os dados e tente novamente.
              </p>
            )}
            </form>
          </section>
        </CanCreateComunicado>

        <section className="glass-panel p-6">
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Histórico de comunicados
              </h3>
              <p className="text-sm text-slate-500">
                {comunicados.length} {comunicados.length === 1 ? "comunicado encontrado" : "comunicados encontrados"}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <label className="form-label flex items-center gap-2">
                <Filter className="h-4 w-4" /> Buscar
              </label>
              <input
                className="form-input"
                placeholder="Protocolo, assunto, origem ou destino"
                value={filters.search || ""}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">Tipo</label>
              <select
                className="form-input"
                value={filters.tipo || ""}
                onChange={(e) =>
                  handleFilterChange({ tipo: e.target.value as ComunicadoFilters["tipo"] })
                }
              >
                <option value="">Todos</option>
                {tipoComunicadoOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Responsável</label>
              <input
                className="form-input"
                placeholder="Nome do responsável"
                value={filters.responsavel || ""}
                onChange={(e) => handleFilterChange({ responsavel: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">Data início</label>
              <input
                type="date"
                className="form-input"
                value={filters.dataInicio || ""}
                onChange={(e) => handleFilterChange({ dataInicio: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">Data fim</label>
              <input
                type="date"
                className="form-input"
                value={filters.dataFim || ""}
                onChange={(e) => handleFilterChange({ dataFim: e.target.value })}
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-3 flex items-center justify-end">
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
                Limpar filtros
              </button>
            </div>
          )}

          <div className="mt-4 space-y-3">
            {comunicados.map((item) => (
              <div
                key={item.id}
                className={`relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-4 pl-6 shadow-sm transition-all hover:shadow-md ${
                  item.tipo === "ENTRADA" ? "border-l-4 border-l-emerald-400" : "border-l-4 border-l-indigo-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">
                      {item.protocolo}
                    </p>
                    <h4 className="text-lg font-semibold text-slate-900">
                      {item.assunto}
                    </h4>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      item.tipo === "ENTRADA"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-indigo-100 text-indigo-700"
                    }`}
                  >
                    {item.tipo === "ENTRADA" ? "Entrada" : "Saída"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{item.conteudo}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                  <div>
                    Origem: <strong>{item.origem ?? "—"}</strong>
                  </div>
                  <div>
                    Destino: <strong>{item.destino ?? "—"}</strong>
                  </div>
                  <div>
                    Responsável: <strong>{item.responsavel ?? "—"}</strong>
                  </div>
                  <div>
                    Data: <strong>{formatDate(item.dataRegistro)}</strong>
                  </div>
                </div>
              </div>
            ))}
            {comunicados.length === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white/50 p-8 text-center text-sm text-slate-400">
                Nenhum comunicado encontrado para os filtros selecionados.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
