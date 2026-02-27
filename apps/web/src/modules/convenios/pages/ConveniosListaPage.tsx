import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Filter,
  FileBarChart2,
  FileSpreadsheet,
  Loader2,
  PlusCircle,
  RefreshCcw,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ResumoModal } from "@/modules/convenios/components/modals/ResumoModal";
import { PageHeader } from "@/modules/shared/components/PageHeader";
import { StatusBadge } from "@/modules/shared/components/StatusBadge";
import { CanCreateConvenio } from "@/modules/shared/components/PermissionGate";
import {
  convenioStatusOptions,
  esferaGovernoOptions,
  modalidadeRepasseOptions,
} from "@/modules/shared/constants";
import {
  convenioService,
  type ConvenioFilters,
} from "@/modules/convenios/services/convenioService";
import { configService } from "@/modules/configuracoes/services/configService";
import { formatCurrency, formatDate } from "@/modules/shared/utils/format";
import { toast } from "@/modules/shared/ui/toaster";

const ITEMS_PER_PAGE = 10;

export const ConveniosListaPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ConvenioFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [resumoModal, setResumoModal] = useState<{
    id: string;
    titulo: string;
  } | null>(null);

  const { data: catalogs } = useQuery({
    queryKey: ["catalogs"],
    queryFn: () => configService.getCatalogs(),
  });

  const conveniosQuery = useQuery({
    queryKey: ["convenios", filters],
    queryFn: () => convenioService.list(filters),
  });

  const convenios = conveniosQuery.data ?? [];

  // Paginação local
  const totalPages = Math.ceil(convenios.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedConvenios = convenios.slice(startIndex, endIndex);

  const secretariaOptions = useMemo(
    () => catalogs?.secretarias ?? [],
    [catalogs?.secretarias],
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFilterChange = (newFilters: Partial<ConvenioFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const getExportRows = async () => {
    const conveniosDetalhados = await Promise.all(
      convenios.map((convenio) => convenioService.getById(convenio.id)),
    );

    return conveniosDetalhados.map((convenio) => {
      const valorGlobal = Number(convenio.valorGlobal ?? 0);
      const valorRepasse = Number(convenio.valorRepasse ?? 0);
      const valorContrapartida = Number(convenio.valorContrapartida ?? 0);
      const valorLiberado = Number(
        convenio.financeiroContas?.valorLiberadoTotal ?? 0,
      );
      const rendimentos = Number(
        convenio.financeiroContas?.saldoRendimentos ?? 0,
      );
      const cpExclusiva =
        convenio.contratos?.reduce(
          (acc, c) => acc + Number(c.valorCPExclusiva ?? 0),
          0,
        ) ?? 0;

      const quantidadeContratos = convenio.contratos?.length ?? 0;
      const quantidadeAditivos =
        convenio.aditivos?.filter((a) => !a.contratoId).length ?? 0;
      const quantidadePendenciasAbertas =
        convenio.pendencias?.filter(
          (p) => p.status === "ABERTA" || p.status === "EM_ANDAMENTO",
        ).length ?? 0;
      const valorContratado =
        convenio.contratos?.reduce(
          (acc, c) => acc + Number(c.valorContrato ?? 0),
          0,
        ) ?? 0;
      const valorPago =
        convenio.contratos?.reduce(
          (acc, c) =>
            acc +
            (c.medicoes?.reduce(
              (sum, m) => sum + Number(m.valorPago ?? 0),
              0,
            ) ?? 0),
          0,
        ) ?? 0;

      return {
        codigo: convenio.codigo,
        titulo: convenio.titulo,
        objeto: convenio.objeto,
        status: convenio.status,
        secretaria: convenio.secretaria?.nome ?? "",
        orgao: convenio.orgao?.nome ?? "",
        programa: convenio.programa?.nome ?? "",
        fonte: convenio.fonte?.nome ?? "",
        numeroTermo: convenio.numeroTermo ?? "",
        numeroProposta: convenio.numeroProposta ?? "",
        esfera: convenio.esfera ?? "",
        modalidadeRepasse: convenio.modalidadeRepasse ?? "",
        dataAssinatura: convenio.dataAssinatura
          ? formatDate(convenio.dataAssinatura)
          : "",
        dataInicioVigencia: convenio.dataInicioVigencia
          ? formatDate(convenio.dataInicioVigencia)
          : "",
        dataFimVigencia: convenio.dataFimVigencia
          ? formatDate(convenio.dataFimVigencia)
          : "",
        valorGlobal,
        valorRepasse,
        valorContrapartida,
        valorLiberado,
        rendimentos,
        cpExclusiva,
        valorContratado,
        valorPago,
        processoSPD: convenio.processoSPD ?? "",
        processoCreditoAdicional: convenio.processoCreditoAdicional ?? "",
        area: convenio.area ?? "",
        banco: convenio.financeiroContas?.banco ?? "",
        agencia: convenio.financeiroContas?.agencia ?? "",
        contaBancaria: convenio.financeiroContas?.contaBancaria ?? "",
        quantidadeContratos,
        quantidadeAditivos,
        quantidadePendenciasAbertas,
      };
    });
  };

  const downloadFile = (
    content: string,
    fileName: string,
    mimeType: string,
  ) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const escapeCsvField = (value: string | number) => {
    const text = String(value ?? "");
    if (text.includes(";") || text.includes('"') || text.includes("\n")) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  const exportCsv = async () => {
    if (!convenios.length) {
      toast.error("Não há convênios para exportar com os filtros atuais.");
      return;
    }

    setIsExporting(true);
    const loadingToast = toast.loading("Preparando exportação CSV...");

    try {
      const rows = await getExportRows();
      const headers = [
        "Código",
        "Título",
        "Objeto",
        "Status",
        "Secretaria",
        "Órgão Concedente",
        "Programa",
        "Fonte de Recurso",
        "Nº do Termo",
        "Nº da Proposta",
        "Data Assinatura",
        "Vigência Início",
        "Vigência Fim",
        "Esfera",
        "Modalidade de Repasse",
        "Valor Global",
        "Valor Repasse",
        "Valor Contrapartida",
        "Valor Liberado",
        "Rendimentos",
        "CP Exclusiva/Recurso Próprio",
        "Valor Contratado",
        "Valor Pago",
        "Processo SPD",
        "Processo Crédito Adicional",
        "Área",
        "Banco",
        "Agência",
        "Conta Bancária",
        "Qtd. Contratos",
        "Qtd. Aditivos (Convênio)",
        "Qtd. Pendências Abertas",
      ];

      const csvLines = [
        headers.join(";"),
        ...rows.map((row) =>
          [
            row.codigo,
            row.titulo,
            row.objeto,
            row.status,
            row.secretaria,
            row.orgao,
            row.programa,
            row.fonte,
            row.numeroTermo,
            row.numeroProposta,
            row.dataAssinatura,
            row.dataInicioVigencia,
            row.dataFimVigencia,
            row.esfera,
            row.modalidadeRepasse,
            row.valorGlobal.toFixed(2),
            row.valorRepasse.toFixed(2),
            row.valorContrapartida.toFixed(2),
            row.valorLiberado.toFixed(2),
            row.rendimentos.toFixed(2),
            row.cpExclusiva.toFixed(2),
            row.valorContratado.toFixed(2),
            row.valorPago.toFixed(2),
            row.processoSPD,
            row.processoCreditoAdicional,
            row.area,
            row.banco,
            row.agencia,
            row.contaBancaria,
            row.quantidadeContratos,
            row.quantidadeAditivos,
            row.quantidadePendenciasAbertas,
          ]
            .map(escapeCsvField)
            .join(";"),
        ),
      ];

      downloadFile(
        `\uFEFF${csvLines.join("\n")}`,
        `convenios-${new Date().toISOString().slice(0, 10)}.csv`,
        "text/csv;charset=utf-8;",
      );
      toast.success("CSV exportado com sucesso.");
    } catch {
      toast.error("Erro ao exportar CSV.");
    } finally {
      toast.dismiss(loadingToast);
      setIsExporting(false);
    }
  };

  const escapeHtml = (value: string | number) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const exportExcel = async () => {
    if (!convenios.length) {
      toast.error("Não há convênios para exportar com os filtros atuais.");
      return;
    }

    setIsExporting(true);
    const loadingToast = toast.loading("Preparando exportação Excel...");

    try {
      const rows = await getExportRows();
      const headerCells = [
        "Código",
        "Título",
        "Objeto",
        "Status",
        "Secretaria",
        "Órgão Concedente",
        "Programa",
        "Fonte de Recurso",
        "Nº do Termo",
        "Nº da Proposta",
        "Data Assinatura",
        "Vigência Início",
        "Vigência Fim",
        "Esfera",
        "Modalidade de Repasse",
        "Valor Global",
        "Valor Repasse",
        "Valor Contrapartida",
        "Valor Liberado",
        "Rendimentos",
        "CP Exclusiva/Recurso Próprio",
        "Valor Contratado",
        "Valor Pago",
        "Processo SPD",
        "Processo Crédito Adicional",
        "Área",
        "Banco",
        "Agência",
        "Conta Bancária",
        "Qtd. Contratos",
        "Qtd. Aditivos (Convênio)",
        "Qtd. Pendências Abertas",
      ]
        .map((header) => `<th>${escapeHtml(header)}</th>`)
        .join("");

      const bodyRows = rows
        .map((row) => {
          const cells = [
            row.codigo,
            row.titulo,
            row.objeto,
            row.status,
            row.secretaria,
            row.orgao,
            row.programa,
            row.fonte,
            row.numeroTermo,
            row.numeroProposta,
            row.dataAssinatura,
            row.dataInicioVigencia,
            row.dataFimVigencia,
            row.esfera,
            row.modalidadeRepasse,
            formatCurrency(row.valorGlobal),
            formatCurrency(row.valorRepasse),
            formatCurrency(row.valorContrapartida),
            formatCurrency(row.valorLiberado),
            formatCurrency(row.rendimentos),
            formatCurrency(row.cpExclusiva),
            formatCurrency(row.valorContratado),
            formatCurrency(row.valorPago),
            row.processoSPD,
            row.processoCreditoAdicional,
            row.area,
            row.banco,
            row.agencia,
            row.contaBancaria,
            row.quantidadeContratos,
            row.quantidadeAditivos,
            row.quantidadePendenciasAbertas,
          ]
            .map((cell) => `<td>${escapeHtml(cell)}</td>`)
            .join("");

          return `<tr>${cells}</tr>`;
        })
        .join("");

      const htmlTable = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head><meta charset="UTF-8" /></head>
        <body>
          <table>
            <thead><tr>${headerCells}</tr></thead>
            <tbody>${bodyRows}</tbody>
          </table>
        </body>
      </html>
    `;

      downloadFile(
        `\uFEFF${htmlTable}`,
        `convenios-${new Date().toISOString().slice(0, 10)}.xls`,
        "application/vnd.ms-excel;charset=utf-8;",
      );
      toast.success("Excel exportado com sucesso.");
    } catch {
      toast.error("Erro ao exportar Excel.");
    } finally {
      toast.dismiss(loadingToast);
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Convênios"
        subtitle="Visualize, edite e gerencie todos os convênios cadastrados."
        actions={
          <div className="flex gap-2">
            <button
              onClick={exportCsv}
              disabled={isExporting}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:text-primary-600"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4" />
              )}
              CSV
            </button>
            <button
              onClick={exportExcel}
              disabled={isExporting}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:text-primary-600"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4" />
              )}
              Excel
            </button>
            <button
              onClick={() => conveniosQuery.refetch()}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:text-primary-600"
            >
              <RefreshCcw className="h-4 w-4" />
              Atualizar
            </button>
            <CanCreateConvenio>
              <button
                onClick={() => navigate("/convenios/cadastrar")}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-500"
              >
                <PlusCircle className="h-4 w-4" />
                Novo convênio
              </button>
            </CanCreateConvenio>
          </div>
        }
      />

      <section className="glass-panel space-y-4 p-6">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Convênios cadastrados
            </h3>
            <p className="text-sm text-slate-500">
              {convenios.length}{" "}
              {convenios.length === 1
                ? "convênio encontrado"
                : "convênios encontrados"}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
          <div>
            <label className="form-label flex items-center gap-2">
              <Filter className="h-4 w-4" /> Buscar
            </label>
            <input
              className="form-input"
              placeholder="Título ou código"
              value={filters.search || ""}
              onChange={(event) =>
                handleFilterChange({ search: event.target.value })
              }
            />
          </div>
          <div>
            <label className="form-label">Status</label>
            <select
              className="form-input"
              value={filters.status || ""}
              onChange={(event) =>
                handleFilterChange({
                  status:
                    (event.target.value as ConvenioFilters["status"]) || "",
                })
              }
            >
              <option value="">Todos</option>
              {convenioStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Secretaria</label>
            <select
              className="form-input"
              value={filters.secretariaId || ""}
              onChange={(event) =>
                handleFilterChange({ secretariaId: event.target.value })
              }
            >
              <option value="">Todas</option>
              {secretariaOptions.map((secretaria) => (
                <option key={secretaria.id} value={secretaria.id}>
                  {secretaria.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Esfera de governo</label>
            <select
              className="form-input"
              value={filters.esfera || ""}
              onChange={(event) =>
                handleFilterChange({ esfera: event.target.value })
              }
            >
              <option value="">Todas</option>
              {esferaGovernoOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Modalidade de repasse</label>
            <select
              className="form-input"
              value={filters.modalidadeRepasse || ""}
              onChange={(event) =>
                handleFilterChange({ modalidadeRepasse: event.target.value })
              }
            >
              <option value="">Todas</option>
              {modalidadeRepasseOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Vigência - Início</label>
            <input
              type="date"
              className="form-input"
              value={filters.dataInicioVigencia || ""}
              onChange={(event) =>
                handleFilterChange({ dataInicioVigencia: event.target.value })
              }
            />
          </div>
          <div>
            <label className="form-label">Vigência - Fim</label>
            <input
              type="date"
              className="form-input"
              value={filters.dataFimVigencia || ""}
              onChange={(event) =>
                handleFilterChange({ dataFimVigencia: event.target.value })
              }
            />
          </div>
          <div>
            <label className="form-label">Faixa de valor (R$)</label>
            <div className="flex gap-2">
              <input
                type="number"
                className="form-input"
                placeholder="Mín"
                value={filters.valorMin || ""}
                onChange={(event) =>
                  handleFilterChange({ valorMin: event.target.value })
                }
              />
              <input
                type="number"
                className="form-input"
                placeholder="Máx"
                value={filters.valorMax || ""}
                onChange={(event) =>
                  handleFilterChange({ valorMax: event.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="relative overflow-x-auto rounded-3xl border border-slate-100">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Convênio</th>
                <th className="px-4 py-3">Secretaria</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Vigência</th>
                <th className="px-4 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white/70">
              {paginatedConvenios.map((convenio) => (
                <tr key={convenio.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-900">
                      {convenio.titulo}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      {convenio.codigo}
                      <StatusBadge status={convenio.status} />
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {convenio.secretaria?.nome ?? "—"}
                  </td>
                  <td className="px-4 py-4 font-semibold text-slate-900">
                    {formatCurrency(convenio.valorGlobal)}
                  </td>
                  <td className="px-4 py-4 text-slate-500">
                    {formatDate(convenio.dataInicioVigencia)} <br />{" "}
                    <span className="text-xs text-slate-400">
                      até {formatDate(convenio.dataFimVigencia)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => navigate(`/convenios/${convenio.id}`)}
                        className="inline-flex items-center gap-1 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                        title="Ver detalhes"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Detalhes
                      </button>
                      <button
                        onClick={() =>
                          setResumoModal({
                            id: convenio.id,
                            titulo: convenio.titulo,
                          })
                        }
                        className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-100"
                        title="Ver resumo"
                      >
                        <FileBarChart2 className="h-3.5 w-3.5" />
                        Resumo
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {paginatedConvenios.length === 0 && (
            <p className="p-6 text-center text-sm text-slate-400">
              Nenhum convênio encontrado com os filtros atuais.
            </p>
          )}
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <p className="text-sm text-slate-600">
              Exibindo {startIndex + 1} a {Math.min(endIndex, convenios.length)}{" "}
              de {convenios.length} convênios
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={[
                        "rounded-xl px-3 py-2 text-sm font-semibold transition",
                        page === currentPage
                          ? "bg-primary-600 text-white"
                          : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200",
                      ].join(" ")}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      {resumoModal && (
        <ResumoModal
          convenioId={resumoModal.id}
          convenioTitulo={resumoModal.titulo}
          onClose={() => setResumoModal(null)}
        />
      )}
    </div>
  );
};
