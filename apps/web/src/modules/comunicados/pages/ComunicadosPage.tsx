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
  RefreshCcw,
  Search,
  Send,
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
import { CanCreateComunicado } from "@/modules/shared/components/PermissionGate";
import { tipoComunicadoOptions } from "@/modules/shared/constants";
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

type SummaryCardProps = {
  label: string;
  value: string | number;
  helper: string;
  icon: LucideIcon;
  accent: string;
  iconTone: string;
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
    helper: "Total retornado pelos filtros atuais",
    icon: FolderOpen,
    accent: "from-primary-500/10 via-primary-100/60 to-white",
    iconTone: "bg-primary-50 text-primary-600",
  },
  {
    label: "Entradas",
    value: metrics.entradas,
    helper: "Protocolos recebidos",
    icon: MailPlus,
    accent: "from-emerald-500/10 via-emerald-100/60 to-white",
    iconTone: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Saídas",
    value: metrics.saidas,
    helper: "Protocolos expedidos",
    icon: Send,
    accent: "from-amber-500/10 via-amber-100/60 to-white",
    iconTone: "bg-amber-50 text-amber-600",
  },
  {
    label: "Responsáveis",
    value: metrics.responsaveis,
    helper: "Servidores identificados",
    icon: UserRound,
    accent: "from-sky-500/10 via-sky-100/60 to-white",
    iconTone: "bg-sky-50 text-sky-600",
  },
];

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
  accent,
  iconTone,
}: SummaryCardProps) => (
  <Card className={`overflow-hidden border-white/60 bg-gradient-to-br ${accent} shadow-card`}>
    <CardContent className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <strong className="mt-3 block text-3xl font-semibold tracking-tight text-slate-900">
            {value}
          </strong>
          <p className="mt-2 text-sm text-slate-500">{helper}</p>
        </div>
        <span className={`rounded-2xl p-3 ${iconTone}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </CardContent>
  </Card>
);

const getTipoClasses = (tipo: Comunicado["tipo"]) =>
  tipo === "ENTRADA"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-amber-200 bg-amber-50 text-amber-700";

export const ComunicadosPage = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ComunicadoFilters>({});
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedComunicado, setSelectedComunicado] = useState<Comunicado | null>(null);

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
    defaultValues: {
      tipo: "ENTRADA",
    },
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
    if (tipoSelecionado === "ENTRADA") {
      resetField("origem");
      return;
    }

    resetField("destino");
  }, [resetField, tipoSelecionado]);

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

  const createMutation = useMutation({
    mutationFn: (payload: ComunicadoForm) => comunicadoService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comunicados"] });
      reset({ tipo: "ENTRADA" } as ComunicadoForm);
      setIsCreateOpen(false);
      toast.success("Comunicado registrado com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao criar comunicado. Verifique os dados e tente novamente.");
    },
  });

  const onSubmit = (data: ComunicadoForm) => {
    createMutation.mutate(data);
  };

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
              <Button type="button" onClick={() => setIsCreateOpen(true)}>
                <MailPlus className="h-4 w-4" />
                Registrar comunicado
              </Button>
            </CanCreateComunicado>
          </div>
        }
      />

      <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white px-6 py-6 shadow-card">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(79,70,229,0.14),_transparent_30%),radial-gradient(circle_at_left,_rgba(16,185,129,0.12),_transparent_24%)]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <Badge className="border-primary-100 bg-primary-50 px-3 py-1 text-primary-700 hover:bg-primary-50">
              Central de comunicados
            </Badge>
            <div>
              <h3 className="text-2xl font-semibold tracking-tight text-slate-900">
                Historico organizado para consulta rapida
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                O cadastro deixa de competir com a listagem. Agora o foco principal
                fica na leitura dos registros, com filtros mais visiveis, indicadores
                resumidos e detalhes acessiveis em painel lateral.
              </p>
            </div>
          </div>
          <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
              <p className="font-semibold text-slate-900">{metrics.total}</p>
              <p>itens no contexto atual</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
              <p className="font-semibold text-slate-900">{hasActiveFilters ? "Sim" : "Nao"}</p>
              <p>filtros aplicados</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
              <p className="font-semibold text-slate-900">
                {comunicados[0] ? formatDate(comunicados[0].dataRegistro) : "--"}
              </p>
              <p>registro mais recente</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedComunicado(item)}
                    className="group text-left"
                  >
                    <Card className="h-full overflow-hidden border-slate-200 bg-white transition duration-300 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-lg">
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
                              Destino
                            </p>
                            <p className="mt-2 text-sm font-medium text-slate-700">
                              {item.destino?.trim() || "Nao informado"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                          <span className="text-sm font-medium text-slate-500">
                            Toque para ver os detalhes completos
                          </span>
                          <span className="text-sm font-semibold text-primary-600 transition group-hover:text-primary-700">
                            Abrir painel
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto rounded-[32px] border border-slate-200 bg-white p-0 shadow-2xl sm:max-w-4xl">
          <DialogHeader className="border-b border-slate-100 px-6 py-5">
            <DialogTitle className="flex items-center gap-3 text-xl text-slate-900">
              <span className="rounded-2xl bg-primary-50 p-2.5 text-primary-600">
                <MailPlus className="h-5 w-5" />
              </span>
              Registrar comunicado
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Cadastre o protocolo com os campos ja usados pelo sistema, agora em
              um fluxo mais objetivo e sem competir com a consulta do historico.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-6 px-6 py-6" onSubmit={handleSubmit(onSubmit)}>
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
                    <Label htmlFor="destino">Destinatario</Label>
                    <Input
                      id="destino"
                      {...register("destino")}
                      placeholder="Setor ou responsavel"
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="origem">Origem</Label>
                    <Input
                      id="origem"
                      {...register("origem")}
                      placeholder="Secretaria ou orgao"
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

            {createMutation.isError && (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                Erro ao registrar comunicado. Verifique os dados e tente novamente.
              </p>
            )}

            <DialogFooter className="gap-2 border-t border-slate-100 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                disabled={createMutation.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Registrando..." : "Registrar comunicado"}
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
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className={`border ${getTipoClasses(selectedComunicado.tipo)}`}>
                    {selectedComunicado.tipo === "ENTRADA" ? "Entrada" : "Saida"}
                  </Badge>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {selectedComunicado.protocolo}
                  </span>
                </div>
                <SheetTitle className="mt-3 text-2xl leading-tight text-slate-900">
                  {selectedComunicado.assunto}
                </SheetTitle>
                <SheetDescription className="text-sm leading-6 text-slate-500">
                  Detalhamento completo do comunicado selecionado para consulta rapida
                  sem sair da lista.
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
                  <DetailItem label="Destino" value={selectedComunicado.destino} />
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
    </div>
  );
};
