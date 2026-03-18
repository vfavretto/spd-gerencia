import { convenioService } from "@/modules/convenios/services/convenioService";
import type { Convenio } from "@/modules/shared/types";
import { formatCurrency, formatDate } from "@/modules/shared/lib/format";

type ExportRow = {
  codigo: string;
  titulo: string;
  objeto: string;
  status: string;
  secretaria: string;
  orgao: string;
  programa: string;
  numeroTermo: string;
  numeroProposta: string;
  esfera: string;
  modalidadeRepasse: string;
  dataAssinatura: string;
  dataInicioVigencia: string;
  dataFimVigencia: string;
  valorGlobal: number;
  valorRepasse: number;
  valorContrapartida: number;
  valorLiberado: number;
  rendimentos: number;
  cpExclusiva: number;
  valorContratado: number;
  valorPago: number;
  processoSPD: string;
  processoCreditoAdicional: string;
  area: string;
  banco: string;
  agencia: string;
  contaBancaria: string;
  quantidadeContratos: number;
  quantidadeAditivos: number;
  quantidadePendenciasAbertas: number;
};

const exportHeaders = [
  "Código",
  "Título",
  "Objeto",
  "Status",
  "Secretaria",
  "Órgão Concedente",
  "Programa",
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
  "Qtd. Pendências Abertas"
] as const;

const escapeCsvField = (value: string | number) => {
  const text = String(value ?? "");
  if (text.includes(";") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

const escapeHtml = (value: string | number) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const downloadFile = (content: string, fileName: string, mimeType: string) => {
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

const toExportRow = (convenio: Convenio): ExportRow => {
  const valorGlobal = Number(convenio.valorGlobal ?? 0);
  const valorRepasse = Number(convenio.valorRepasse ?? 0);
  const valorContrapartida = Number(convenio.valorContrapartida ?? 0);
  const valorLiberado = Number(convenio.financeiroContas?.valorLiberadoTotal ?? 0);
  const rendimentos = Number(convenio.financeiroContas?.saldoRendimentos ?? 0);
  const cpExclusiva =
    convenio.contratos?.reduce((acc, contrato) => acc + Number(contrato.valorCPExclusiva ?? 0), 0) ?? 0;
  const quantidadeContratos = convenio.contratos?.length ?? 0;
  const quantidadeAditivos = convenio.aditivos?.filter((aditivo) => !aditivo.contratoId).length ?? 0;
  const quantidadePendenciasAbertas =
    convenio.pendencias?.filter((pendencia) => pendencia.status === "ABERTA" || pendencia.status === "EM_ANDAMENTO")
      .length ?? 0;
  const valorContratado =
    convenio.contratos?.reduce((acc, contrato) => acc + Number(contrato.valorContrato ?? 0), 0) ?? 0;
  const valorPago =
    convenio.contratos?.reduce(
      (acc, contrato) =>
        acc +
        (contrato.medicoes?.reduce((sum, medicao) => sum + Number(medicao.valorPago ?? 0), 0) ?? 0),
      0
    ) ?? 0;

  return {
    codigo: convenio.codigo,
    titulo: convenio.titulo,
    objeto: convenio.objeto,
    status: convenio.status,
    secretaria: convenio.secretaria?.nome ?? "",
    orgao: convenio.orgao?.nome ?? "",
    programa: convenio.programa?.nome ?? "",
    numeroTermo: convenio.numeroTermo ?? "",
    numeroProposta: convenio.numeroProposta ?? "",
    esfera: convenio.esfera ?? "",
    modalidadeRepasse: convenio.modalidadeRepasse?.nome ?? "",
    dataAssinatura: convenio.dataAssinatura ? formatDate(convenio.dataAssinatura) : "",
    dataInicioVigencia: convenio.dataInicioVigencia ? formatDate(convenio.dataInicioVigencia) : "",
    dataFimVigencia: convenio.dataFimVigencia ? formatDate(convenio.dataFimVigencia) : "",
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
    quantidadePendenciasAbertas
  };
};

const buildCsvContent = (rows: ExportRow[]) => {
  const csvLines = [
    exportHeaders.join(";"),
    ...rows.map((row) =>
      [
        row.codigo,
        row.titulo,
        row.objeto,
        row.status,
        row.secretaria,
        row.orgao,
        row.programa,
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
        row.quantidadePendenciasAbertas
      ]
        .map(escapeCsvField)
        .join(";")
    )
  ];

  return `\uFEFF${csvLines.join("\n")}`;
};

const buildExcelContent = (rows: ExportRow[]) => {
  const headerCells = exportHeaders.map((header) => `<th>${escapeHtml(header)}</th>`).join("");
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
        row.quantidadePendenciasAbertas
      ]
        .map((cell) => `<td>${escapeHtml(cell)}</td>`)
        .join("");

      return `<tr>${cells}</tr>`;
    })
    .join("");

  return `\uFEFF
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
};

const loadExportRows = async (convenios: Convenio[]) => {
  const detailedConvenios = await Promise.all(convenios.map((convenio) => convenioService.getById(convenio.id)));
  return detailedConvenios.map(toExportRow);
};

const buildExportFileName = (extension: "csv" | "xls") =>
  `convenios-${new Date().toISOString().slice(0, 10)}.${extension}`;

export const exportConvenios = {
  async csv(convenios: Convenio[]) {
    const rows = await loadExportRows(convenios);
    downloadFile(buildCsvContent(rows), buildExportFileName("csv"), "text/csv;charset=utf-8;");
  },
  async excel(convenios: Convenio[]) {
    const rows = await loadExportRows(convenios);
    downloadFile(
      buildExcelContent(rows),
      buildExportFileName("xls"),
      "application/vnd.ms-excel;charset=utf-8;"
    );
  }
};
