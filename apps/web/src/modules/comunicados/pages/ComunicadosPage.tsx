import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MailPlus, RefreshCcw } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { CanCreateComunicado } from "@/modules/shared/components/PermissionGate";
import { tipoComunicadoOptions } from "@/modules/shared/constants";
import { comunicadoService } from "@/modules/comunicados/services/comunicadoService";
import { convenioService } from "@/modules/convenios/services/convenioService";
import { formatDate } from "@/modules/shared/utils/format";

const comunicadoSchema = z.object({
  protocolo: z.string().min(3, "Informe o número do protocolo"),
  assunto: z.string().min(3, "Assunto obrigatório"),
  conteudo: z.string().optional(),
  tipo: z.enum(["ENTRADA", "SAIDA"]),
  status: z.string().optional(),
  origem: z.string().optional(),
  destino: z.string().optional(),
  responsavel: z.string().optional(),
  arquivoUrl: z.string().optional(),
  convenioId: z.number().optional()
});

type ComunicadoForm = z.infer<typeof comunicadoSchema>;

export const ComunicadosPage = () => {
  const queryClient = useQueryClient();
  const [tipoFiltro, setTipoFiltro] = useState<string>("");

  const comunicadosQuery = useQuery({
    queryKey: ["comunicados"],
    queryFn: () => comunicadoService.list()
  });

  const conveniosQuery = useQuery({
    queryKey: ["convenios", { lite: true }],
    queryFn: () => convenioService.list()
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ComunicadoForm>({
    resolver: zodResolver(comunicadoSchema),
    defaultValues: {
      tipo: "ENTRADA"
    }
  });

  const createMutation = useMutation({
    mutationFn: (payload: ComunicadoForm) =>
      comunicadoService.create({
        ...payload,
        convenioId: payload.convenioId || null
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comunicados"] });
      reset({ tipo: "ENTRADA" } as ComunicadoForm);
    },
    onError: (error: Error) => {
      console.error("Erro ao criar comunicado:", error);
    }
  });

  const comunicados = comunicadosQuery.data ?? [];
  const convenios = conveniosQuery.data ?? [];
  const comunicadosFiltrados = tipoFiltro
    ? comunicados.filter((item) => item.tipo === tipoFiltro)
    : comunicados;

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
                <label className="form-label">Origem</label>
                <input
                  className="form-input"
                  {...register("origem")}
                  placeholder="Secretaria ou órgão"
                />
              </div>
              <div>
                <label className="form-label">Destino</label>
                <input
                  className="form-input"
                  {...register("destino")}
                  placeholder="Setor ou responsável"
                />
              </div>
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
                <label className="form-label">Status interno</label>
                <input
                  className="form-input"
                  {...register("status")}
                  placeholder="Pendente, Em andamento..."
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="form-label">Link do arquivo</label>
                <input
                  className="form-input"
                  {...register("arquivoUrl")}
                  placeholder="https://"
                />
              </div>
              <div>
                <label className="form-label">Convênio associado</label>
                <select
                  className="form-input"
                  {...register("convenioId", {
                    setValueAs: (value) =>
                      value === "" ? undefined : Number.parseInt(value, 10)
                  })}
                >
                  <option value="">Nenhum</option>
                  {convenios.map((convenio) => (
                    <option key={convenio.id} value={convenio.id}>
                      {convenio.titulo}
                    </option>
                  ))}
                </select>
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
              <p className="text-sm text-slate-500">Filtre por tipo para analisar.</p>
            </div>
            <div className="flex items-center gap-3">
              {tipoComunicadoOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    setTipoFiltro((prev) =>
                      prev === option.value ? "" : option.value
                    )
                  }
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                    tipoFiltro === option.value
                      ? "bg-primary-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {comunicadosFiltrados.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl border border-slate-100 bg-white/70 p-4 shadow-sm"
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
                  {item.convenio && (
                    <div>
                      Convênio: <strong>{item.convenio.titulo}</strong>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {comunicadosFiltrados.length === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white/50 p-8 text-center text-sm text-slate-400">
                Nenhum comunicado encontrado para o filtro selecionado.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
